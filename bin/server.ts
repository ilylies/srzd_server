#!/usr/bin/env node

/**
 * Module dependencies.
 */

 import app from "../app";
 import debug from "debug";
 debug('ts-express:server');
 import http from "http";
 import express from "express";
 
 /**
  * Get port from environment and store in Express.
  */
 
 const port = normalizePort(process.env.PORT || '3000');
 app.set('port', port);
 
 /**
  * Create HTTP server.
  */
 
 const server = http.createServer(app);
 
 /**
  * Listen on provided port, on all network interfaces.
  */
 
 server.listen(port);
 server.on('error', onError);
 server.on('listening', onListening);
 
 /**
  * Normalize a port into a number, string, or false.
  */
 
 function normalizePort(val : string) {
   const port = parseInt(val, 10);
 
   if (isNaN(port)) {
     // named pipe
     return val;
   }
 
   if (port >= 0) {
     // port number
     return port;
   }
 
   return false;
 }
 
 /**
  * Event listener for HTTP server "error" event.
  */
 
 function onError(error : any) {
   if (error.syscall !== 'listen') {
     throw error;
   }
 
   const bind = typeof port === 'string'
     ? 'Pipe ' + port
     : 'Port ' + port;
 
   // handle specific listen errors with friendly messages
   switch (error.code) {
     case 'EACCES':
       console.error(bind + ' requires elevated privileges');
       process.exit(1);
       break;
     case 'EADDRINUSE':
       console.error(bind + ' is already in use');
       process.exit(1);
       break;
     default:
       throw error;
   }
 }
 
 /**
  * Event listener for HTTP server "listening" event.
  */
 
 function onListening() {
   const addr = server.address();
   const bind = typeof addr === 'string'//addr: string | AddressInfo | null
     ? 'pipe ' + addr
     : 'port ' + addr!.port;//因为上面使用了类型保护,所有会有null,而null是不能被 . 的, 所以这里使用!
   debug('Listening on ' + bind);
 }