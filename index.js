const express=require('express')
const cors =require('cors')
const dotenv=require('dotenv')
const mongoose=require('mongoose')
const dns = require("dns")
const OTP =require('./models/OTP.js')
const authRoutes=require('./routes/auth.js')
const eventRoutes=require('./routes/event.js')
const bookingRoutes=require('./routes/booking.js')
dns.setServers(["8.8.8.8"])
dotenv.config()
const app =express()
app.use(cors())
app.use(express.json())
//routes
app.use('/api/auth',authRoutes)
app.use('/api/events',eventRoutes)
app.use('/api/bookings',bookingRoutes)

mongoose.connect(process.env.mongo_url)
.then(()=>{
    console.log('connected to mongodb')
    console.log('Database name:', mongoose.connection.name)
    console.log('Database host:', mongoose.connection.host)
    
})
.catch((error)=>{
    console.error('error connected to mongodb: ',error)
})


const port=process.env.port || 5000;

app.listen(port,()=>{
    console.log(`server is listening on ${port}`)
})