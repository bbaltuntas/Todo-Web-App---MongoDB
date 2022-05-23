const express = require("express")
const date = require(__dirname + "/date.js")
const app = express()

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://bbaltuntas:bora123@cluster0.biqvq.mongodb.net/test?retryWrites=true&w=majority")


app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))

app.set('view engine', 'ejs');


const todoSchema = new mongoose.Schema({
    name: String,
})
const Todo = mongoose.model("Todo", todoSchema)

const listSchema = new mongoose.Schema({
    name: String,
    items: [todoSchema],
})
const List = mongoose.model("List", listSchema)

const todo1 = new Todo({
    name: "Movie"
})
const todo2 = new Todo({
    name: "Study"
})

const defaultItems = [todo1, todo2]
app.get("/", (req, res) => {

    const currentDay = date.getDate()
    Todo.find(function (err, todosResult) {
        if (err) {
            console.log(err)
        } else {
            List.find({}, function (err, result) {
                res.render('index', {listTitle: currentDay, newItems: todosResult, categoryList: result});
            })

        }
    })

})
app.get("/:customListName", (req, res) => {
    const customListName = req.params.customListName
    List.findOne({name: customListName}, function (err, result) {
        if (!err) {
            if (!result) {
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect("/" + customListName)
            } else {
                List.find({}, function (err, categoryList) {
                    res.render('index', {listTitle: result.name, newItems: result.items, categoryList: categoryList})
                })

            }
        }
    })
})


app.post("/", (req, res) => {
    let newItem = req.body.newItem
    const route = req.headers.referer.split("/")[3]

    const todo = new Todo({
        name: newItem
    })
    if (route === "") {
        if (newItem.trim() === "") {
        } else {
            todo.save()
        }
        res.redirect("/")
    } else {
        List.findOne({name: route}, function (err, resultList) {
            resultList.items.push(todo)
            resultList.save()
            res.redirect("/" + route)
        })
    }


})
app.post("/delete", (req, res) => {
    const route = req.headers.referer.split("/")[3]
    const delenda = req.body.checkbox
    console.log(delenda)
    console.log(route)
    if (route === "") {
        Todo.findByIdAndRemove(delenda, function (err) {
            if (!err) {
                console.log("Deleted Successfully")
            }
        })
        res.redirect("/")
    } else {
        List.findOneAndUpdate({name: route}, {$pull: {items: {_id: delenda}}}, function (err, result) {
            if (!err) {
                console.log("Deleted Successfully")
            }
        })
        res.redirect("/" + route)
    }


})
app.post("/deleteCategory", (req, res) => {
    const deletedCategory = req.body.category
    List.deleteOne({name: deletedCategory}, function (err, result) {
        if (!err) {
            console.log(result)
            res.redirect("/")
        }
    })
})
app.post("/addCategory", (req, res) => {
    const newCategory = req.body.category.trim()
    res.redirect("/" + newCategory)
})
app.get("/work", (req, res) => {
    res.render("index", {listTitle: "Work List", newItems: workList})
})

app.listen(port, () => {
    console.log(`App is running on http://localhost:${port}`)
})