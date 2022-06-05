import { io } from 'socket.io-client'
import { UserEvents } from '../api/socket-api'

const socket = io()

socket.emit(UserEvents.client.CREATE_USER, { name: 'Jerry' })
