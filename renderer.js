/**
 * Renderer Process (Preload Script)
 * This script runs before the web page is loaded and has access to both
 * Node.js APIs and the DOM. It's used to safely expose specific functionality
 * to the renderer process.
 */

// This file can be used to expose specific Node.js APIs to the renderer
// For now, we keep it minimal as the dashboard works with direct GitHub API calls

console.log('Monocle PR Dashboard - Renderer process loaded');
