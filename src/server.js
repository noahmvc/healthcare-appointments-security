const http = require('http');
const fs = require('fs');
const path = require('path');

const {
  createAppointment,
  getAppointments,
  getAppointmentTypes
} = require('./appointments');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store'
  });

  response.end(JSON.stringify(payload, null, 2));
}

function sendFile(response, filePath, contentType) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, {
        'Content-Type': 'text/plain',
        'X-Content-Type-Options': 'nosniff'
      });

      response.end('Not found');
      return;
    }

    response.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store'
    });

    response.end(content);
  });
}

function parseRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', chunk => {
      body += chunk;

      if (body.length > 1000000) {
        request.destroy();
        reject(new Error('Request body is too large.'));
      }
    });

    request.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON request body.'));
      }
    });

    request.on('error', reject);
  });
}

async function requestHandler(request, response) {
  if (request.method === 'GET' && request.url === '/') {
    sendFile(response, path.join(PUBLIC_DIR, 'index.html'), 'text/html');
    return;
  }

  if (request.method === 'GET' && request.url === '/styles.css') {
    sendFile(response, path.join(PUBLIC_DIR, 'styles.css'), 'text/css');
    return;
  }

  if (request.method === 'GET' && request.url === '/app.js') {
    sendFile(response, path.join(PUBLIC_DIR, 'app.js'), 'application/javascript');
    return;
  }

  if (request.method === 'GET' && request.url === '/api/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'healthcare appointment app'
    });
    return;
  }

  if (request.method === 'GET' && request.url === '/api/appointments') {
    sendJson(response, 200, {
      appointments: getAppointments()
    });
    return;
  }

  if (request.method === 'GET' && request.url === '/api/appointment-types') {
    sendJson(response, 200, {
      appointmentTypes: getAppointmentTypes()
    });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/appointments') {
    try {
      const body = await parseRequestBody(request);
      const result = createAppointment(body);

      if (!result.ok) {
        sendJson(response, result.statusCode, {
          errors: result.errors
        });
        return;
      }

      sendJson(response, result.statusCode, {
        appointment: result.appointment
      });
      return;
    } catch (error) {
      sendJson(response, 400, {
        errors: [error.message]
      });
      return;
    }
  }

  sendJson(response, 404, {
    errors: ['Route not found.']
  });
}

function createServer() {
  return http.createServer(requestHandler);
}

if (require.main === module) {
  const server = createServer();

  server.listen(PORT, () => {
    console.log(`Healthcare appointment app running at http://localhost:${PORT}`);
  });
}

module.exports = {
  createServer,
  requestHandler
};
