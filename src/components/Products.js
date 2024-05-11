import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import ProductCard from "./ProductCard";
import Cart,{generateCartItemsFrom, getTotalCartValue} from './Cart'

import "./Products.css";

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTime, setDebounceTime] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [cartData, setCartData] = useState([]);
  const [cartItems, setCartItems] = useState([]);




  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {

    try{
      const response = await axios.get(`${config.endpoint}/products`);
      return response.data;

    }catch(error){
      console.log(error.response)

    }
  };

  // useEffect( async ()=>{
  //   setLoading(true);
  //   const response = await performAPICall();
  //   setProductList(response);
  //   setLoading(false);
  // },[])
 
  
  

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {

    try{

      const response = await axios.get(`${config.endpoint}/products/search?value=${text}`)
      setProductList(response.data);

    }catch(error){
      console.log(error);
      setProductList([]);
    }

  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */

  const debounceSearch = (event, debounceTimeId) => {
    
    //stored the entered keyword by user
    let text=event.target.value;

    //debounce logic
    if(debounceTimeId){
      clearTimeout(debounceTimeId);
    }
    let newTimeOut= setTimeout(()=>{performSearch(text)},500);
    setDebounceTime(newTimeOut);
  };


  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const response = await axios.get(`${config.endpoint}/cart`,{ headers : {Authorization: `Bearer ${token}`}});
      const data = await response.data;
      setCartData(data)
      return data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };


  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.find((item)=>item.productId===productId)
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
      if (!token) {
        enqueueSnackbar('Login to add an item to the Cart', { variant: "error" });
        return;
      };

      if(options.preventDuplicate===true && isItemInCart(items, productId)){
        enqueueSnackbar('Item already in cart. Use the cart sidebar to update quantity or remove item.', { variant: "error" });
        return;
      }
      try{
        const response = await axios.post(`${config.endpoint}/cart`,
          {
            productId: productId,
            qty: qty
          },
          { headers : {
                  Authorization: `Bearer ${token}`
            }, 
          }
          );
          
        const data = response.data;
        generateCartItemsFrom(data, products).then((cartItems)=>setCartItems(cartItems))
      }catch(error){
        console.log(error)
      }
    
  };



  useEffect( () => {
   
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await performAPICall();
        setProductList(response);
      } catch (error) {
        // Handle errors appropriately
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    }
    fetchData();


  },[]);
  
 




  useEffect(() => {
    const token = localStorage.getItem('token')
    fetchCart(token)
    .then((data)=>generateCartItemsFrom(data, productList))
    .then((cartItems)=>{setCartItems(cartItems)})
  },[productList])
  


  return (
    <div>
      <Header hasHiddenAuthButtons={true}>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}

        {/* Search view for desktop */}
      <TextField
        className="search-desktop"
        size="medium"
        
        
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary"  />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange = {(event)=>debounceSearch(event, debounceTime)}

        
      />

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange = {(event)=>debounceSearch(event, debounceTime)}
       
      />

      </Header>


      {/* // This is the section we are going to gave 70% md={9} and 30% md={3} */}

      {localStorage.getItem('token') ? (
      <Grid item container>
      <Grid item container xs = {12} md={9}>

      <Box className="hero">
             <p className="hero-heading">
               India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
               to your door step
             </p>
      </Box>

      
     
       <Grid container spacing={2} sx={{
        paddingTop: 2, 
        width:"100%",
      }}>
        
         <Grid item className="product-grid">
         {loading ? (
          <> 
            <CircularProgress/> 
            <br/> 
            <h5>Loading products...</h5> 
          </>
        ) : (
          <Grid container spacing={2} sx={{
            padding: 2,
            display: "flex",
            justifyContent:"center",
            alignItems:"center" ,
            width:"100%",
          }}>
            {productList.length === 0 ? (<div ><SentimentDissatisfied sx={{
            display: "flex",
            width:"100%",
          }}/> <h2>No products found</h2> </div>) 
          :
           Array.from(productList).map((product) => (
              <Grid item xs={6} md={3} key={product._id}>
                  <ProductCard product={product} handleAddToCart={()=>addToCart(localStorage.getItem('token') , cartItems, productList, product._id, 1,{preventDuplicate:true})}/>
             </Grid>
            ))}
          </Grid>
        )}

         </Grid>
       </Grid>
       </Grid>
       <Grid container item xs = {12} md={3}>
        <Cart products = {productList} items={cartItems} handleQuantity = {addToCart}/>
       </Grid>
      </Grid>
      ):(
        <>
  
        <Box className="hero">
               <p className="hero-heading">
                 India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
                 to your door step
               </p>
        </Box>
  
        
       
         <Grid container spacing={2} sx={{
          paddingTop: 2, 
          width:"100%",
        }}>
          
           <Grid item className="product-grid">
           {loading ? (
            <> 
              <CircularProgress/> 
              <br/> 
              <h5>Loading products...</h5> 
            </>
          ) : (
            <Grid container spacing={2} sx={{
              padding: 2,
              display: "flex",
              justifyContent:"center",
              alignItems:"center" ,
              width:"100%",
            }}>
              {productList.length === 0 ? (<div ><SentimentDissatisfied sx={{
              display: "flex",
              width:"100%",
            }}/> <h2>No products found</h2> </div>) 
            :
             Array.from(productList).map((product) => (
                <Grid item xs={6} md={3} key={product._id}>
                    <ProductCard product={product} handleAddToCart={()=>addToCart(localStorage.getItem('token') , cartItems, productList, product._id, 1,{preventDuplicate:true})}/>
               </Grid>
              ))}
            </Grid>
          )}
                       
           </Grid>
         </Grid>
         </>

      )}
       
      <Footer />
    </div>
  );
};

export default Products;
