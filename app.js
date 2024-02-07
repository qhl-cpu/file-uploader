const express = require('express');
const app = express();
const fs = require('fs');

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.post('/upload2', (req, res) => {
    let rawData = '';
  
    req.on('data', (chunk) => {
      rawData += chunk.toString('binary');
    });
  
    req.on('end', () => {
      // divide each file
      const fileDivider = '--' + req.headers['content-type'].split('boundary=')[1];
      const noDividerContent = rawData.split(fileDivider);

      for (let i = 0; i < noDividerContent.length; i++) {
        if (noDividerContent[i] == '--\r\n') {
          // end of the request, return
          return;
        }
        if (noDividerContent[i] != '') {
          // extract file name
          const fileName = noDividerContent[i].split('filename="')[1].split('"\r\n')[0];
          // extract rest of the file content
          const fileContent = noDividerContent[i].split('\r\n\r\n')[1].replace(/\r\n$/, '');

          fs.writeFile(`${__dirname}/uploads/${fileName}`, fileContent, 'binary', (err) => {
            if (err) {
              console.error('Failed to save the file:', err);
              // Handle error (e.g., send a 500 server error response)
            } else {
              console.log('File saved successfully.');
              // Continue processing (e.g., send a success response)
            }
          });
        }
      }
    });
    
    res.send('File uploaded successfully.');
  });
  
const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('listening on port', {port});
});