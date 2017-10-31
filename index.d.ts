import express = require('express');
declare function modrewrite(rewrites: string[]): express.RequestHandler;
declare namespace modrewrite { }
export = modrewrite;
