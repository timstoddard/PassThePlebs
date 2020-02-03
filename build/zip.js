const archiver = require('archiver')
const fs = require('fs')

// https://stackoverflow.com/questions/15641243/need-to-zip-an-entire-directory-using-node-js
/**
 * @param {String} source
 * @param {String} out
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 } })
  const stream = fs.createWriteStream(out)

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream)

    stream.on('close', () => resolve())
    archive.finalize()
  })
}

zipDirectory('./dist', './dist/PassThePlebs.zip')
