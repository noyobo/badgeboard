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

gulp.task('tbody', function(){
  var reg = /\!\[([^\]\[]+)\]\(([^\(\)]+)\)\]\(([^\(\)]+)\)/
  var begin = '<tr>';
  var end = '</tr>'
  var content = '<td><a href="{{root.github}}{{repo}}" target="_blank">{{name}}</a></td>'
  for (var i = config.length - 1; i >= 0; i--) {
    var badge = config[i];
    badge = reg.exec(badge)
    content += '<td><a href="'+badge[3]+'"><img src="'+badge[2]+'" alt="'+badge[1]+'"/></a></td>'
  };
  content = content.replace(/(\<\%\=|\%\>)/g, function(match, p1){
    return p1 === '%>'? '}}' : '{{'
  })
  content = begin + content + end;
  fs.writeFileSync('./views/tbody.xtpl', content)
})

gulp.task('html', ['tbody'], function() {
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
