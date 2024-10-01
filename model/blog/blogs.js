const { default: mongoose } = require("mongoose");
const blogSchema = new mongoose.Schema({
    title: {
        type: String
    },
    content: {
        type: String
    },
    image: {
        type: String
    },
    category: {
        type: String
    },
    isScheduled: {
        type: Boolean,
        default: true
    },
    publishTime: {
        type: String,
        required: false
    }
})
module.exports = mongoose.model("Post", blogSchema)