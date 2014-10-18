'use strict';

var gulp = require('gulp')
var del = require('del')
var xtemplate = require('xtpl')
var yamljs = require('yamljs')
var template = require('template')
var Minimize = require('minimize')
var markdown = require('markdown-creator')
var fs = require('fs')

var minimize = new Minimize({quotes: true})

var config = yamljs.load('./config.yml')
var packageData = yamljs.load('./data.yml')
gulp.task('html', function() {
  var indnx = xtemplate.renderFile('./views/content.xtpl', packageData, function(err, content) {
    minimize.parse(content, function(err, data) {
      fs.writeFileSync('index.html', data)
    })
  })
})

gulp.task('mark', function() {
  var file = 'README.md'
  fs.writeFileSync(file, markdown.title('badgeboard', 1))
  fs.appendFileSync(file, markdown.text('NPM徽章墙, 如果你也喜欢, 欢迎fork, 修改`data.yml` `gulp build` 生成'))
  fs.appendFileSync(file, markdown.title('Projects', 2))
  var thead = ['Packages name', '']
  var tbody = []
  Object.keys(packageData.projects).forEach(function(i) {
    var row = [],
      rowtxt = ''
    var item = packageData.projects[i];
    row.push(markdown.link(item.name, packageData.github + item.repo))
    for (var i = 0; i < config.length; i++) {
      var k = config[i];
      rowtxt += (template(k, item) + ' ');
    };
    row.push(rowtxt)
    tbody.push(row)
  })
  fs.appendFileSync(file, markdown.table(thead, tbody))
})

gulp.task('build', ['html', 'mark'])
gulp.task('default', ['build'])
