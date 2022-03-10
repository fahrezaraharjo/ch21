var express = require('express');
const moment = require('moment');
var router = express.Router();
var path = require('path');



module.exports = function (db) {


  router.get('/', function (req, res,) {

    const url = req.url == "/" ? "/?page=1&sortBy=id&sortMode=asc" : req.url

    const params = []


    if (req.query.id) {
      params.push(`id = ${req.query.id}`)
    }
    if (req.query.string) {
      params.push(`stringdata like '%${req.query.string}%'`)
    }
    if (req.query.integer) {
      params.push(`integerdata = ${req.query.integer}`)
    }
    if (req.query.float) {
      params.push(`floatdata = ${req.query.float}`)
    }
    if (req.query.startdate && req.query.enddate) {
      params.push(`datedata between '${req.query.startdate}' and '${req.query.enddate}'`)
    }
    if (req.query.boolean) {
      params.push(`booleandata = ${req.query.boolean}`)
    }


    const page = req.query.page || 1
    const limit = 3
    const offset = (page - 1) * limit
    let sql = `select count(*) as total from todo`;
    if (params.length > 0) {
      sql += ` where ${params.join(' and ')}`
    }
    console.log(sql)
    db.query(sql, (err, row) => {
      console.log(err)
      const pages = Math.ceil(row.rows[0].total / limit)
      sql = "select * from todo"
      if (params.length > 0) {
        sql += ` where ${params.join(' and ')}`
      }
      req.query.sortMode = req.query.sortMode || 'asc';

      req.query.sortBy = req.query.sortBy || 'id';

      sql += ` order by ${req.query.sortBy} ${req.query.sortMode}`

      sql += ` limit $1 offset $2 `
      db.query(sql, [limit, offset], (err, rows) => {
        if (err) return res.send(err)
        db.query('select * from todo order by id', (err, todo) => {
          if (err) return res.send(err)
          db.query('select * from todo order by stringdata', (err, todo) => {
            if (err) return res.send(err)
            res.render('list', {
              data: rows.rows,
              page,
              pages,
              query: req.query,
              url,
              todo: todo.rows,
              moment
            });

          })
        })
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
      if (err) {
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
    db.query('select * from todo where id = $1', [Number(req.params.id)], (err, item) => {
      if (err) return res.send(err)

      res.render('edit', {
        data: item.rows[0],
        moment
      })
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

    db.query('update todo set stringdata = $1, integerdata = $2, floatdata = $3, datedata = $4, booleandata = $5 where id = $6', [string, integer, float, date, boolean, id], (err, row) => {
      if (err) return res.send(err)

      res.redirect('/')
    });
  });




  return router;
}