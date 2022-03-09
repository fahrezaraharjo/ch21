var express = require('express');
var router = express.Router();
var path = require('path');

module.exports = function (db) {


router.get('/',function (req, res,) {

  const url = req.url == "/" ? "/?page=1" : req.url

  const params = []


  if (req.query.id) {
    params.push(`id like '%${req.query.id}%'`)
  }
  if (req.query.boolean) {
    params.push(`boolean = ${req.query.boolean}`)
  }


  const page = req.query.page || 1
  const limit = 3
  const offset = (page - 1) * limit
  let sql = `select count(*) as total from todo`;
  if (params.length > 0) {
    sql += ` where ${params.join('and')}`
  }

  db.query(sql, (err, row) => {
    const pages = Math.ceil(row.total / limit)
    sql = "select * from todo"
    if (params.length > 0) {
      sql += ` where ${params.join(' and ')}`
    }

    sql += ` limit $1 offset $2 `
    db.query(sql, [limit, offset], (err, rows) => {
      if (err) return res.send(err)
      res.render('list', { data: rows.rows, page, pages, query: req.query, url});
    })
  })  
})

router.get('/add', function (req, res) {
  res.render('add')
})

router.post('/add', function (req, res) {
  console.log(req.body)
  let string = req.body.string
  let integer = parseInt(req.body.integer)
  let float = parseFloat(req.body.float)
  let date = req.body.date
  let boolean = JSON.parse(req.body.boolean)
  


  //Quary Binding
  db.query('insert into todo(stringdata, integerdata, floatdata, datedata, booleandata) values ($1, $2, $3, $4, $5)', [string, integer, float, date, boolean], (err) => {
    if (err){
      console.log(err)
      return res.send(err)
    } 
    res.redirect('/')
  })
})

router.get('/delete/:id', function (req, res) {
  const id = req.params.id
  db.query('delete from todo where id = $1', [Number(id)], (err) => {
    if (err) return res.send(err)
    res.redirect('/')
  })
})

router.get('/edit/:id', function (req, res) {
  const id = req.params.id
  db.query('select * from todo where id = $1', [Number(id)], (err, item) => {
    if (err) return res.send(err)
    res.render('edit', { data: item })
  })
})

router.post('/edit/:id', function (req, res) {
  const id = Number(req.params.id)
  const string = req.body.string
  const integer = req.body.integer
  const float = req.body.float
  const date = req.body.date
  const boolean = req.body.boolean
  console.log(req)
  
  db.query('update todo set string = $1, integer = $2, float = $3, date = $4, boolean = $5 where id = $6', [string, integer, float, date, boolean, id], (err, row) => {
    if (err) return res.send(err)
    
    res.redirect('/')
  });
  });




return router;
}