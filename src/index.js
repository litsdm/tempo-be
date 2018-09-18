import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import aws from 'aws-sdk';
import initializeDb from './db';
import middleware from './middleware';
import api from './api';
import config from './config.json';

const { S3_BUCKET } = process.env;

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.json({
	limit : config.bodyLimit
}));

// connect to db
initializeDb( db => {

	const signS3 = (req, res) => {
      const s3 = new aws.S3();
      const fileName = req.query['file-name'];
      const fileType = req.query['file-type'];
      const folderName = req.query['folder-name'];
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: `${folderName}/${fileName}`,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
      };

      s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if (err) return res.end();

        const returnData = {
          signedRequest: data,
          url: `https://${S3_BUCKET}.s3.amazonaws.com/${folderName}/${fileName}`
        };
        res.write(JSON.stringify(returnData));
        res.end();
      });
    };

		const deleteS3 = (req, res) => {
      const s3 = new aws.S3();
      const { filename } = req.body;
      const s3Params = {
        Bucket: S3_BUCKET,
        Key: filename
      };

      s3.deleteObject(s3Params, (err) => {
        if (err) console.log(err);

        res.end();
      });
    };

	// internal middleware
	app.use(middleware({ config, db }));

	// api router
	app.use('/api', api({ config, db }));
	app.get('/api/sign-s3', signS3);
  app.post('/api/delete-s3', deleteS3);

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
	});
});

export default app;
