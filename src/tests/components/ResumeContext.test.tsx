import { render, screen, act, waitFor } from '@testing-library/react';
import { ResumeProvider, useResume } from '../../context/ResumeContext';
import '@testing-library/jest-dom';

// Mock crypto.subtle.digest for JSDOM environment
beforeAll(() => {
    Object.defineProperty(global.self, 'crypto', {
        value: {
            subtle: {
                digest: jest.fn().mockImplementation(async (algo, data) => {
                    // Simple mock hash based on data length and a static prefix, just for testing
                    const buffer = new ArrayBuffer(32);
                    const view = new Uint8Array(buffer);
                    for (let i = 0; i < data.length && i < 32; i++) {
                        view[i] = data[i];
                    }
                    return buffer;
                }),
            },
        },
    });
});

// A dummy component to interact with ResumeContext
const TestComponent = () => {
    const {
        data,
        updatePersonalInfo,
        currentHash,
        cvHistory,
        saveToHistory,
        loadFromHistory,
        deleteFromHistory,
        resetData
    } = useResume();

    return (
        <div>
            <div data-testid="fullName">{data.personalInfo.fullName}</div>
            <div data-testid="email">{data.personalInfo.email}</div>
            <div data-testid="currentHash">{currentHash || 'null'}</div>
            <div data-testid="historyLength">{cvHistory.length}</div>

            <button onClick={() => updatePersonalInfo('fullName', 'John Doe')}>Set Name</button>
            <button onClick={() => updatePersonalInfo('email', 'john@example.com')}>Set Email</button>
            <button onClick={saveToHistory}>Save to History</button>
            <button onClick={resetData}>Reset Data</button>

            <button onClick={() => loadFromHistory(cvHistory[0]?.hash || '')}>Load History 0</button>
            <button onClick={() => deleteFromHistory(cvHistory[0]?.hash || '')}>Delete History 0</button>
        </div>
    );
};

describe('ResumeContext CV History Features', () => {
    beforeEach(() => {
        // Clear local storage before each test
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('generates a hash when personal info changes', async () => {
        render(
            <ResumeProvider>
                <TestComponent />
            </ResumeProvider>
        );

        expect(screen.getByTestId('currentHash')).toHaveTextContent('null');

        act(() => {
            screen.getByText('Set Name').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('currentHash')).not.toHaveTextContent('null');
        });

        const newHash = screen.getByTestId('currentHash').textContent;

        act(() => {
            screen.getByText('Set Email').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('currentHash').textContent).not.toBe(newHash);
            expect(screen.getByTestId('currentHash').textContent).not.toBe('null');
        });
    });

    it('saves a CV to history', async () => {
        render(
            <ResumeProvider>
                <TestComponent />
            </ResumeProvider>
        );

        act(() => {
            screen.getByText('Set Name').click();
        });

        // Wait for hash to generate
        await waitFor(() => {
            expect(screen.getByTestId('currentHash')).not.toHaveTextContent('null');
        });

        expect(screen.getByTestId('historyLength')).toHaveTextContent('0');

        act(() => {
            screen.getByText('Save to History').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('historyLength')).toHaveTextContent('1');
        });

        // Verify local storage is updated
        expect(localStorage.getItem('cvHistory')).toContain('John Doe');
    });

    it('overwrites existing history if hash matches', async () => {
        render(
            <ResumeProvider>
                <TestComponent />
            </ResumeProvider>
        );

        act(() => {
            screen.getByText('Set Name').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('currentHash')).not.toHaveTextContent('null');
        });

        // Save first time
        act(() => {
            screen.getByText('Save to History').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('historyLength')).toHaveTextContent('1');
        });

        // Save second time with same hash
        act(() => {
            screen.getByText('Save to History').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('historyLength')).toHaveTextContent('1'); // length should still be 1
        });
    });

    it('loads from history', async () => {
        render(
            <ResumeProvider>
                <TestComponent />
            </ResumeProvider>
        );

        act(() => {
            screen.getByText('Set Name').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('currentHash')).not.toHaveTextContent('null');
        });

        act(() => {
            screen.getByText('Save to History').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('historyLength')).toHaveTextContent('1');
        });

        // Reset data
        act(() => {
            screen.getByText('Reset Data').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('fullName')).toHaveTextContent(/^$/); // empty
        });

        // Load data
        act(() => {
            screen.getByText('Load History 0').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('fullName')).toHaveTextContent('John Doe');
        });
    });

    it('deletes from history', async () => {
        render(
            <ResumeProvider>
                <TestComponent />
            </ResumeProvider>
        );

        act(() => {
            screen.getByText('Set Name').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('currentHash')).not.toHaveTextContent('null');
        });

        act(() => {
            screen.getByText('Save to History').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('historyLength')).toHaveTextContent('1');
        });

        act(() => {
            screen.getByText('Delete History 0').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('historyLength')).toHaveTextContent('0');
        });
    });

    it('resets data', async () => {
        // Set an existing autosave
        localStorage.setItem('cvAutoSave', '{"some": "data"}');
        document.cookie = 'cvDataSaved=true; path=/'; // dummy cookie

        render(
            <ResumeProvider>
                <TestComponent />
            </ResumeProvider>
        );

        act(() => {
            screen.getByText('Set Name').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('fullName')).toHaveTextContent('John Doe');
        });

        act(() => {
            screen.getByText('Reset Data').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('fullName')).toHaveTextContent(/^$/);
            expect(localStorage.getItem('cvAutoSave')).toBeNull();
            expect(document.cookie).not.toContain('cvDataSaved=true'); // Or at least it should be expired
        });
    });
});
