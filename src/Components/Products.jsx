import React, { useState, useEffect } from 'react';
import { Form, FormControl, Button, Col, Row, Card, ListGroup, Pagination, Placeholder } from 'react-bootstrap';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

const Products = () => {
  const [prods, setProds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(20);

  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const response = await axios.post('http://localhost:5632/home', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          Role: role,
        },
      });

      setProds(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product data:', error);
      setError('Error fetching product data. Please try again later.'); // Set a meaningful error message
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };
  const handleCardClick = (productId) => {
    localStorage.setItem("pid",productId);
    navigate('/prodPage');
  };

  const handleSort = (sortType) => {
    let sortedProds = [];
    switch (sortType) {
      case 'lowToHigh':
        sortedProds = [...prods].sort((a, b) => a.price - b.price);
        break;
      case 'highToLow':
        sortedProds = [...prods].sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        sortedProds = [...prods].sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        break;
    }
    setProds(sortedProds);
  };

  const handleCategorySelect = (category) => {
    const updatedCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((cat) => cat !== category)
      : [...selectedCategories, category];

    setSelectedCategories(updatedCategories);
    setCurrentPage(1);
  };

  const handlePrescriptionFilter = (event) => {
    setPrescriptionFilter(event.target.checked);
  };

  if (loading) {
    const placeholders = Array.from({ length: 4 }).map((_, index) => (
      <Col key={index} md={3} className="mb-4">
        <Card style={{ height: '100%' }}>
          <div style={{ height: '150px', objectFit: 'contain', backgroundColor: '#e9ecef' }}></div>
          <Card.Body style={{ display: 'flex', flexDirection: 'column' }}>
            <Placeholder as={Card.Title} animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
            <Placeholder as={Card.Text} animation="glow">
              <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />
            </Placeholder>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
              <Placeholder.Button variant="primary" xs={6} />
              <Placeholder.Button variant="success" xs={6} />
            </div>
          </Card.Body>
          <ListGroup className="list-group-flush">
            <Placeholder as={ListGroup.Item} animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
          </ListGroup>
        </Card>
      </Col>
    ));

    return <Row>{placeholders}</Row>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const filterByPriceRange = (product) => {
    if (priceRange === '') return true;
    if (priceRange === '0-50') return product.price >= 0 && product.price <= 50;
    if (priceRange === '0-100') return product.price >= 0 && product.price <= 100;
    if (priceRange === '0-150') return product.price >= 0 && product.price <= 150;
    if (priceRange === '>150') return product.price > 150;
    return true;
  };

  const filteredProducts = prods.filter((product) =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const role = localStorage.getItem('role');

  const productCards = currentProducts.map((product, index) => (
    <Col key={index} md={3} className="mb-4">
      <Card className="h-full cursor-pointer" onClick={(e) => handleCardClick(e, product._id)}>
        <Card.Img variant="top" src={product.imageUrl} className="h-36 object-contain" />
        <Card.Body className="flex flex-col">
          <Card.Title>{product.productName}</Card.Title>
          <Card.Text style={product.quantity > 0 ? {color:'green'} :{color:'red'}}>
            {product.quantity > 0 ? 'Available' : 'Out of Stock'}
          </Card.Text>
        </Card.Body>
        <ListGroup className="list-group-flush">
          <ListGroup.Item>Price: ₹{product.price.toFixed(2)}</ListGroup.Item>
          {localStorage.getItem("role") === 'admin' && (<ListGroup.Item>Quantity: {product.quantity}</ListGroup.Item>)}
        </ListGroup>
        <Card.Body className="flex justify-between">
          {role !== 'admin' ? (
            <>
              <Button variant="primary" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
              <Button variant="success" onClick={() => handleBuyNow(product)}>Buy Now</Button>
            </>
          ) : (
            <>
              <Button variant="warning" onClick={() => handleEdit(product._id)}>Edit</Button>
              <Button variant="danger" onClick={() => handleEdit(product._id)}>Remove</Button>
            </>
          )}
        </Card.Body>
      </Card>
    </Col>
  ));

  const rows = [];
  for (let i = 0; i < productCards.length; i += 4) {
    const row = (
      <Row key={i}>
        {productCards.slice(i, i + 4)}
      </Row>
    );
    rows.push(row);
  }

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer />
      <div className="text-center my-4">
        <Form inline>
          <Col md={6} className="mx-auto d-flex">
            <FormControl
              type="text"
              placeholder="Search"
              className="mr-2 flex-grow-1"
              value={searchQuery}
              onChange={handleSearch}
            />
            <Button variant="danger">Search</Button>
          </Col>
        </Form>
      </div>
      {rows}
      <Pagination className="justify-content-center mt-4">
        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
        <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
        {[...Array(totalPages).keys()].map(number => (
          <Pagination.Item key={number + 1} active={number + 1 === currentPage} onClick={() => setCurrentPage(number + 1)}>
            {number + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
      </Pagination>
    </div>
  );
};

export {Products};
