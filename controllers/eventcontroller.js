const eventModel=require('../models/event.js')



exports.getAllEvents=async(req,res)=>{
    try{

        const filters={}
        if(req.query.category){
            filters.category=req.query.category
        }

        if(req.query.location){
            filters.location=req.query.location
        }
        const events=await eventModel.find(filters)
        res.json(events)
    }catch(error){
        res.status(500).json({error:error.message})
    }
}

exports.getEventById=async (req,res)=>{
    try{
        const events=await eventModel.findById(req.params.id)
        if(!events){
            return res.status(404).json({error:'Event not found'})
        }
        res.json(events)
    }catch(error){
        return res.status(500).json({error:error.message})
    }

}

exports.createEvent = async (req, res) => {

    const {
        title,
        description,
        date,
        location,
        category,
        totalSeats,
        ticketPrice,
        imageUrl
    } = req.body;

    try {

        const newEvent = await eventModel.create({
            title,
            description,
            date,
            location,
            category,
            totalSeats,
            availableSeats: totalSeats,
            ticketPrice,
            imageUrl,
            createdBy: req.user._id
        });

        res.status(201).json(newEvent);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

exports.updateEvent = async (req, res) => {

    const {
        title,
        description,
        date,
        location,
        category,
        totalSeats,
        ticketPrice,
        imageUrl
    } = req.body;

    try {

        const event = await eventModel.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                error: 'Event not found'
            });
        }

        // Number of seats already booked
        const bookedSeats = event.totalSeats - event.availableSeats;

        // New available seats
        const newAvailableSeats = totalSeats - bookedSeats;

        // Cannot make total seats less than booked seats
        if (newAvailableSeats < 0) {
            return res.status(400).json({
                error: 'Total seats cannot be less than booked seats'
            });
        }

        event.title = title;
        event.description = description;
        event.date = date;
        event.location = location;
        event.category = category;
        event.totalSeats = totalSeats;
        event.availableSeats = newAvailableSeats;
        event.ticketPrice = ticketPrice;
        event.imageUrl = imageUrl;

        await event.save();

        res.json(event);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};
exports.deleteEvent=async (req,res)=>{
    try{
    const event =await eventModel.findByIdAndDelete(req.params.id)
    if(!event){
        return res.status(404).json({error:"event not found"})
    }
    res.json({message:'Event deleted successfully'})

    }catch(error){
        return res.status(500).json({error:error.message})
    }
}
