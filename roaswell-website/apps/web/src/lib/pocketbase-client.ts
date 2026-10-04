import PocketBase from 'pocketbase';

/** Lokal ohne Backend: Auth wird nur von den ungenutzten Hooks verwendet. */
const pb = new PocketBase('/');

export default pb;
