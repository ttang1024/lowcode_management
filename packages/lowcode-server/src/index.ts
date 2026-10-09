/**
 * lowcode-server
 *
 * Small decorator-based HTTP server built on Express:
 *
 *   @Controller('/app')
 *   class AppController {
 *     @Post('/update')
 *     update(@Body data: AppModel) {}
 *   }
 *
 *   createServer({ controllers: [AppController] }).listen();
 */
import 'reflect-metadata';

export { Controller, Get, Post, Body, Param, File, Req, Res, Public } from './decorators';
export { UploadedFile } from './arguments';
export { createServer } from './server';
export type { Server, ServerOptions, UploadOptions } from './server';
export type { StaticOptions } from './static';
export type { Request, Response, NextFunction, RequestHandler } from 'express';
