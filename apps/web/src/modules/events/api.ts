'use server';
import { ApiFactory } from "../../global/services/http";

const EventAPI = {
  streamAllEvents: async() => ApiFactory.get('/events/streamEvents')
};

export default EventAPI;
