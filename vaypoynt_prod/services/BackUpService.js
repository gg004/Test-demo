const path = require('path');
const archiver = require('archiver');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const stream = require('stream');

const mysqldump = require('mysqldump')
const MailService = require("./MailService");
const config = require('../config');


// console.log(config)
const emailTo = config.Email_To
const mailFrom = config.Email_From

const createAndUpload = async () => {
  // dump the result straight to a file
  const date = new Date()
  const name = date + '_dump.sql'
  await mysqldump({
    connection: {
      host: config.DB_HOSTNAME,
      user: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
    },
    dumpToFile: path.join(__dirname, '..', 'public', 'backups', name),
  });

  AWS.config.update({
    accessKeyId: config.DYNAMIC_CONFIG_AWS_KEY,
    secretAccessKey: config.DYNAMIC_CONFIG_AWS_SECRET,
    region: config.DYNAMIC_CONFIG_AWS_REGION,
  });

  const archive = archiver('sql', {
    zlib: { level: 9 }, // Sets the compression level.
  });

  archive.directory(path.join(__dirname, '..', 'public', 'backups', name), false);

  const uploadStream = new stream.PassThrough();
  archive.pipe(uploadStream);
  archive.finalize();

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log(err);
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.on('end', function () {
    console.log('archive end');
  });

  await upload(uploadStream);
  console.log('all done');

  const upload = async (pass) => {
    const s3params = {
      Bucket: config.DYNAMIC_CONFIG_AWS_BUCKET,
      Key: name,
      Body: pass,
      ContentType: 'application/octet-stream',
    };
    return s3.upload(s3params).promise();
  };


  switch (response.status) {
    case 200:
      console.log('File created successfully', response.data.id)

      MailService.initialize(config);

      // mailBody = mailBody.replace(new RegExp("{{{" + key + "}}}", "g"), value);

      const data = await MailService.send(mailFrom, emailTo, 'Db Backup', 'Job was successfully completed. Db is now saved to drive click here</a>');
      console.log('completed')
      break
    default:
      console.log('File failed')
      break

  }

}

createAndUpload()