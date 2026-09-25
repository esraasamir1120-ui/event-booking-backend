const jwt=require('jsonwebtoken')
const User=require('../models/user.js')


//user authentication middleware
const protect = async (req, res, next) => {

    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer')) {

        try {

            const token = authHeader.split(' ')[1]

            const decoded = jwt.verify(
                token,
                process.env.jwt_secret
            )

            req.user = await User
                .findById(decoded.id)
                .select('-password')

            if (!req.user) {
                return res.status(401).json({
                    message: 'Not authorized, user not found'
                })
            }

            next()

        } catch (error) {

            console.log(error)

            return res.status(401).json({
                message: 'Not authorized, token failed'
            })
        }

    } else {

        return res.status(401).json({
            message: 'Not authorized, no token'
        })
    }
}

const admin= (req,res,next)=>{
    if (req.user && req.user.role ==='admin'){
        next()
    }
    else{
        return res.status(403).json({message:'Forbidden , admin access required'})
    }
}
module.exports={protect ,admin}