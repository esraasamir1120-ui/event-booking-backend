const Booking=require('../models/booking.js')
const OTP=require('../models/OTP.js')
const Event=require('../models/event.js')
const {sendOtpEmail,sendBookingEmail}=require('../utils/email.js')

const generateOtp=()=>{
    return Math.floor(100000+Math.random()*900000).toString()
}
exports.sendBookingOtp=async(req,res)=>{
  const otp=generateOtp();
  
  try{
    await OTP.findOneAndDelete({email:req.user.email,action:'event_booking'})
  await OTP.create({email:req.user.email,otp:otp,action:'event_booking'})
  await sendOtpEmail(req.user.email,otp,'event_booking')
  res.json({message:'OTP sent to email'})
    
  }catch(error){
     return res.status(500).json({error:error.message})
  }
}

exports.bookEvent=async (req,res)=>{
  try{
    const {eventId, otp}=req.body

    const otpRecording=await OTP.findOne({
      email:req.user.email,
      action:'event_booking'
    })

    if(!otpRecording){
      return res.status(400).json({error:'Invalid or expired OTP'})
    }

    if(otpRecording.otp !== otp){
      return res.status(400).json({error:'Invalid OTP'})
    }

    const event=await Event.findById(eventId)

    if(!event){
      return res.status(404).json({error:'Event not found'})
    }

    if(event.availableSeats<=0){
      return res.status(400).json({error:'No seats available'})
    }

    const existingBooking=await Booking.findOne({
      userId:req.user._id,
      eventId
    })

    if(existingBooking && existingBooking.status !== 'cancelled'){
      return res.status(400).json({
        message:'Already booked or pending'
      })
    }

    const booking=await Booking.create({
      userId:req.user._id,
      eventId,
      status:'pending',
      paymentStatus:'not_paid',
      amount:event.ticketPrice
    })

    await OTP.deleteMany({
      email:req.user.email,
      action:'event_booking'
    })

    res.status(201).json({
      message:'Booking created. Please check your email',
      booking
    })

  }catch(error){
    res.status(500).json({
      message:'Server error',
      error:error.message
    })
  }
}

exports.confirmBooking=async (req,res)=>{
  try{
    const paymentStatus=req.body.paymentStatus

    if(!['paid','not_paid'].includes(paymentStatus)){
      return res.status(400).json({
        error:'Invalid payment status'
      })
    }

    const booking=await Booking.findById(req.params.id)

    if(!booking){
      return res.status(404).json({
        message:'Booking not found'
      })
    }

    if(booking.status === 'confirmed'){
      return res.status(400).json({
        message:'Booking is already confirmed'
      })
    }

    const event=await Event.findById(booking.eventId)

    if(!event){
      return res.status(404).json({
        message:'Event not found'
      })
    }

    if(event.availableSeats <= 0){
      return res.status(400).json({
        message:'No seats available to confirm this booking'
      })
    }

    booking.status='confirmed'
    booking.paymentStatus=paymentStatus

    await booking.save()

    event.availableSeats-=1
    await event.save()

    res.json({
      message:'Booking confirmed successfully',
      booking
    })

  }catch(error){
    res.status(500).json({
      message:'Server Error',
      error:error.message
    })
  }
}
exports.cancelBooking=async(req,res)=>{
  try{
    const booking=await Booking.findById(req.params.id)

    if(!booking){
      return res.status(404).json({
        error:'Booking not found'
      })
    }

    if(booking.userId.toString() !== req.user._id.toString()){
      return res.status(403).json({
        error:'Unauthorized'
      })
    }

    const wasConfirmed=booking.status === 'confirmed'

    booking.status='cancelled'
    await booking.save()

    if(wasConfirmed){
      const event=await Event.findById(booking.eventId)

      if(event){
        event.availableSeats+=1
        await event.save()
      }
    }

    res.json({
      message:'Booking cancelled'
    })

  }catch(error){
    res.status(500).json({
      message:'Server Error',
      error:error.message
    })
  }
}
  exports.getMyBookings=async(req,res)=>{
    try{

    const bookings =req.user.role==='admin'? await Booking.find().populate('eventId').populate('userId','name email').sort({createdT:-1})
    :await Booking.find({userId:req.user.id}).populate('eventId').sort({createdAt:-1})
    res.json(bookings)

    }catch(error){
        res.status(500).json({ message: 'Server Error', error: error.message });

    }

  }



