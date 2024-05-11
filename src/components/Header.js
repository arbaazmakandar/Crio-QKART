import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// eslint-disable-next-line
import { Avatar, Button, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import {Link} from 'react-router-dom'
import "./Header.css";
import Login from './Login'; // Import your Login component
import Register from './Register'; // Import your Register component
import  { useState } from "react";
import { useHistory } from "react-router-dom";





const Header = ({ children, hasHiddenAuthButtons }) => {


  const authToken = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  const history = useHistory();


  const handleLogout = () =>{
    localStorage.clear();
    history.push('/');

  }


    return (
      <Box className="header">
        <Box className="header-title">
            <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        
        {!hasHiddenAuthButtons && (
          
          <Button className="explore-button" startIcon={<ArrowBackIcon />} variant="text" onClick={()=>history.push('/')}>
            Back to explore
          </Button>
        
        )}


        {hasHiddenAuthButtons && (
          
          
          ((authToken === null)) ? 
          <>
          {children}
            <Stack spacing={2} direction="row">
              <Link to="/login">
                <Button variant="text" name="login">Login</Button>
              </Link>
              <Link to="/register">
                <Button variant="contained" name="register">Register</Button>
              </Link>
            </Stack> 
          </>
            :
          <>
            {children}
            <Stack spacing={2} direction="row">
              <img src="avatar.png" alt={username} />
              <span style={{ paddingTop: '15px' }}>{username}</span>
              <Button variant="text" onClick={()=>handleLogout()} name="logout"> LOGOUT </Button>
            </Stack>
          </>
        )}
        
      </Box>
    );
};

export default Header;
