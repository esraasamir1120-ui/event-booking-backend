const user=require('../models/user')
const bcrypt =require('bcryptjs')
const {sendOtpEmail}=require('../utils/email.js')
const OTP =require('../models/OTP.js')
const jwt =require('jsonwebtoken')

const generateToken=(id,role)=>{
    return jwt.sign({id,role},process.env.jwt_secret,{expiresIn:'7d'})
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();


//register user
exports.registerUser=async(req,res)=>{
    const {name,email,password}=req.body;
    let userExists=await user.findOne({email})
    if(userExists){
        return res.status(400).json({error:'user already exists'})
    }
    const salt=await bcrypt.genSalt(10)
    const hashedPassword=await bcrypt.hash(password,salt)
    try{
        const newUser=await user.create({name,email,password:hashedPassword,role:'user',isVerified:false})
      
        const otp=generateOtp()
        console.log(`otp for ${email} : ${otp}`)
        /////
       const savedOtp= await OTP.create({email,otp,action:'account_verification'})
       console.log("OTP SAVED:", savedOtp)

const testOtp = await OTP.find({})

console.log("OTP IMMEDIATELY AFTER CREATE:", testOtp)
//////
        await sendOtpEmail(email,otp,'account_verification')
        
          
         res.status(201).json({message:'user registered successfully',email:newUser.email})
  
    }catch(error){
        res.status(400).json({error:error.message})
    }
}

exports.loginUser=async (req,res)=>{
    try{
        const {email,password} =req.body
        const foundUser=await user.findOne({email})
        if(!foundUser){
            return res.status(400).json({message:'invalid credentials'})
        }
        const isMatch=await bcrypt.compare(password,foundUser.password)
        if(!isMatch){
            return res.status(400).json({message:'invalid credentials'})        }
        if(!foundUser.isVerified && foundUser.role !=='admin'){
            const otp=generateOtp()
            await OTP.create({email:foundUser.email,otp,action:'account_verification'})
            await OTP.deleteMany({email:foundUser.email,action:'account_verification'})
            await sendOtpEmail(foundUser.email,otp,'account_verification')
            return res.status(403).json({message:'Account not verrified',needsVerification:true,email:foundUser.email})

        }

        res.json({
            message:'verified succesfully',
            _id:foundUser.id,
            name:foundUser.name,
            email:foundUser.email,
            role:foundUser.role,
            token:generateToken(foundUser.id,foundUser.role)
        })

    }catch(error){
        res.status(500).json({message:"server error ",erro:error.message})
    }
}


exports.verifyOtp=async (req,res)=>{
    try{
        const {email,otp}=req.body
        ////
         console.log("Email received:", email)
        console.log("OTP received:", otp)
         const allOtps = await OTP.find({})
         console.log("OTPs in database:", allOtps)
        ///////
        const validOtp=await OTP.findOne({email,otp,action:'account_verification'})
        ///
         console.log("Valid OTP:", validOtp)
         /////
        if(!validOtp){
            return res.status(400).json({message:'invalid or expired OTP'})

        }

        const foundUser=await user.findOneAndUpdate({email},{isVerified:true},{new:true})
        await OTP.deleteOne({_id:validOtp.id})//delete otp after usage
        res.json({
            message:'account verified you can login ',
            _id:foundUser.id,
            name:foundUser.name,
            email:foundUser.email,
            role:foundUser.role,
            token:generateToken(foundUser.id,foundUser.role)
        })

    }catch(error){
        res.status(500).json({message:'server error',error:error.message})
    }
}