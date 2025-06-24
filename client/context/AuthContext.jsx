import { createContext,useEffect, useState } from "react";
import axios from 'axios'; 
import toast from "react-hot-toast";
import {connect, io} from 'socket.io-client'
import { data } from "react-router-dom";

const backendUrl = import.meta.env.VITE_BACKEND_URL
axios.defaults.baseURL = backendUrl;


export const AuthContext = createContext();

export const AuthProvider = ({children})=>{
    
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState([])

    // check authentication

    const checkAuth = async ()=>{
        try {
            const {data} = await axios.get("/api/auth/check");
            if(data.success)
            {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }



    // Login function handle

    const login = async (state, credentials  )=>{
        try {
            const {data} = await axios.post(`/api/auth/${state}`, credentials);
            if(data.success)
            {
                setAuthUser(data.user);
                connectSocket(data.user);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token",data.token);
                toast.success(data.message)
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    }

    //Logout Function

    const logout = async ()=>{
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged Out Successfully ...")
        socket.disconnect();
    }

    //UpdateProfile

    const updateProfile = async (body)=>{
        try {
            const {data} = await axios.put("/api/auth/update-profile",body);
            if(data.success)
            {
                setAuthUser(data.user);
                toast.success("File Updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    }

    //Connect Socket
    const connectSocket = (userData)=>{
        if(!userData || socket?.connected) return;
        const newSocket = io(backendUrl,{
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers",(userIds)=>{
            setOnlineUsers(userIds);
        })
    }

    useEffect(()=>{
        if(token)
        {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    },[])

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        logout,
        updateProfile
    }
    return (
        <AuthContext.Provider value={value}>
            {
                children
            }
        </AuthContext.Provider>
    )
}