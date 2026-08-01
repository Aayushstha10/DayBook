const User = require("../models/User");

exports.makeAdmin = async (req, res) => {

    try {

        const { userId } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            {
                role: "admin"
            },
            {
                new: true
            }
        );

        res.json({
            message: "User promoted to admin",
            user
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};