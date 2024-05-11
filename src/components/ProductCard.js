import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
   
} from "@mui/material";
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';


import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card sx={{ maxWidth: 500, maxHeight : 500}} className="card">
        <CardMedia
          component="img"
          height="300"
          image={product.image}
          sx={{
            objectFit: 'contain', // Add object-fit: contain
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {product.name}
          </Typography>
          <Typography gutterBottom variant="h4" component="div">
            ${product.cost}
          </Typography>
          <Rating name="read-only" value={product.rating} readOnly />
          
        </CardContent>
        <CardActions >
          <Button variant="contained" color="primary" className="button" onClick = {handleAddToCart} sx={{
            width: '100%', // Cover full width of the card
            justifyContent: 'center', // Center the button horizontally
          }}>
              <ShoppingCartIcon/>
               Add to cart
          </Button>
        </CardActions>
    </Card>
  );
};

export default ProductCard;
