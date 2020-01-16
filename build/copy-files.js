const fs = require('fs')

fs.copyFileSync('./src/manifest.json','./dist/manifest.json')
const src = './media/icons'
const dest = './dist/icons'
if (!fs.existsSync(dest)){
    //fs.mkdirSync(dest)
}
fs.readdirSync(src)
.filter(file => file.split('.')[1] === 'png')
.forEach(file => fs.copyFile(`${src}/${file}`,`${dest}/${file}`,()=>{}))

