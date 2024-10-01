const blogSchema = require('../model/blog/blogs')
const cloudinary = require('cloudinary').v2
const UserRegister = require("../model/auth/register");
const cron = require("node-cron");
const moment = require("moment");

cloudinary.config({
    cloud_name: 'dmda8jeie',
    api_key: '577636815548136',
    api_secret: '5mnwvgpRV2QFHXi_niAufkwgSGg'
});

const uploadImageToCloudinary = async (filePath) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, (error, result) => {
            if (error) reject(error);
            console.log(error)
            resolve(result.url);
        });
    });
};


const schedulePost = (postId, publishTime) => {

    cron.schedule('* * * * *', async () => {
        try {
            const post = await blogSchema.findById(postId);
            if (post) {
                post.isScheduled = true;
                await post.save();
                console.log(`Post ${postId} is now published!`);
            }
        } catch (error) {
            console.error("Error in scheduling post:", error);
        }
    }, {
        timezone: "Asia/Kolkata"
    })
}


const createPost = async (req, res, next) => {
    try {
        const { title, content, userId, category, publishTime } = req.body;
        const isScheduled = !publishTime;

        let imgUrl = null
        if (req.file) {
            imgUrl = await uploadImageToCloudinary(req.file.path);
        }

        const newPost = new blogSchema({
            title: title,
            content: content,
            category: category,
            publishTime: publishTime ? new Date(publishTime) : null,
            isScheduled: isScheduled,
            image: imgUrl // Get the filename from multer
        });

        const savedPost = await newPost.save()
        // Update the user's posts field
        await UserRegister.findByIdAndUpdate(
            userId,
            { $push: { posts: savedPost } },
            { new: true }
        );

        if (publishTime) {
            schedulePost(savedPost._id, publishTime)
        }

        res.status(200).json({ success: true, message: "Post Created" })

    } catch (error) {
        console.log(error)
        res
            .status(500)
            .json({ success: false, message: "Internal Server Error" })
    }
}

const getPost = async (req, res, next) => {
    try {
        let posts = await blogSchema.find({ isScheduled: true })

        res.status(200).json(posts)
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

const getPostsByCategory = async (req, res, next) => {
    try {
        const { category } = req.query
        console.log(category)

        // Define the base filter
        const filter = { isScheduled: true }; // Only get scheduled posts

        // Add category filter if it's specified and not "All"
        if (category && category !== "All") {
            filter.category = category;
        }

        const filteredPost = await blogSchema.find(filter)

        res.status(200).json({ filteredPost });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

const deletePost = async (req, res, next) => {
    try {
        const { blogId, userId } = req.query
        const postToDelete = await blogSchema.findByIdAndDelete(blogId)

        if (!postToDelete) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        // Step 2: Manually remove the post from the user's posts array
        const user = await UserRegister.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Filter out the post from the posts array
        user.posts = user.posts.filter(post => post._id.toString() !== blogId);

        // Save the updated user document
        await user.save();

        // Return success response
        res.status(200).json({ success: true, message: "Post deleted successfully" });

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}

const editPost = async (req, res) => {
    try {
        const { blogId } = req.query
        const { title, content, category, userId } = req.body;

        const updatePost = await blogSchema.findByIdAndUpdate(
            blogId,
            {
                $set: {
                    title: title,
                    content: content,
                    category: category,
                },
            },
            { new: true }
        );

        if (!updatePost) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        const user = await UserRegister.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Find the post in the user's posts array and update it
        const postIndex = user.posts.findIndex(post => post._id.toString() === blogId);
        if (postIndex > -1) {
            user.posts[postIndex] = updatePost;
            await user.save();
        }

        res.status(200).json({ success: true, message: "Post updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }

}

module.exports = {
    createPost,
    getPost,
    getPostsByCategory,
    deletePost,
    uploadImageToCloudinary,
    editPost,
}