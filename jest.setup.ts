import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { webcrypto } from 'crypto';

Object.defineProperty(global, 'crypto', {
    value: webcrypto,
});
Object.assign(global, { TextDecoder, TextEncoder });
