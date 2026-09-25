const express=require('express')
const router = express.Router()
const {protect,admin}=require('../middleware/auth.js')
const {getAllEvents,getEventById,createEvent,updateEvent,deleteEvent}=require('../controllers/eventcontroller.js')
//get all events 
router.get('/',getAllEvents)

//get event by id 
router.get('/:id',getEventById)

//create event (for admin only )
router.post('/',protect,admin,createEvent)

//update admin (admin only )
router.put('/:id', protect, admin, updateEvent)

//delete event (admin only )
router.delete('/:id',protect,admin,deleteEvent)

module.exports=router