"use client";
import axios from "axios";
import "chart.js/auto";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { FaBox, FaChartLine, FaDollarSign, FaUser } from "react-icons/fa";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import "../app/chart.css"; // Adjust the path based on your project structure

export default function Dashboard() {
  const [salesByLocation, setSalesByLocation] = useState([]);
  const [topSoldProducts, setTopSoldProducts] = useState([]);
  const [customerDetails, setCustomerDetails] = useState([]);
  const [dailySalesTrend, setDailySalesTrend] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10); // Number of items per page

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salesByLocationResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales_by_location`
        );
        setSalesByLocation(salesByLocationResponse.data);
        const topSoldProductsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/top_sold_products`
        );
        setTopSoldProducts(topSoldProductsResponse.data);
        const customerDetailsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customer_details`
        );
        setCustomerDetails(customerDetailsResponse.data);
        const dailySalesTrendResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/daily_sales_trend`
        );
        setDailySalesTrend(dailySalesTrendResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  function MapCenterer({ markers }) {
    const map = useMap();

    useEffect(() => {
      if (markers.length > 0) {
        // Filter out locations with invalid coordinates
        const validMarkers = markers.filter(
          (location) => location.latitude && location.longitude
        );

        if (validMarkers.length > 0) {
          const bounds = L.latLngBounds(
            validMarkers.map((location) => [
              location.latitude,
              location.longitude,
            ])
          );
          map.fitBounds(bounds);
        }
      }
    }, [markers, map]);

    return null;
  }

  // Process data for daily sales trend
  const processDailySalesTrendData = (data, page, itemsPerPage) => {
    // Convert string dates to Date objects
    const dates = data.map((item) => new Date(item["Latest purchase"]));
    const sales = data.map((item) => item.sales);

    // Calculate start and end indices for the current page
    const startIndex = page * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Slice the data for the current page
    const slicedDates = dates.slice(startIndex, endIndex);
    const slicedSales = sales.slice(startIndex, endIndex);

    // Create labels for the x-axis (date)
    const labels = slicedDates.map(
      (date) => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
    );

    return {
      labels,
      datasets: [
        {
          label: "Sales (Bar)",
          data: slicedSales,
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
          type: "bar",
        },
        {
          label: "Sales (Line)",
          data: slicedSales,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
          fill: false,
          type: "line",
        },
      ],
    };
  };

  // Handle page change
  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => {
      const newPage = direction === "next" ? prevPage + 1 : prevPage - 1;
      const totalPages = Math.ceil(dailySalesTrend.length / itemsPerPage);
      return Math.max(0, Math.min(newPage, totalPages - 1)); // Ensure page is within bounds
    });
  };

  const totalPages = Math.ceil(dailySalesTrend.length / itemsPerPage);

  return (
    <div className="container">
      <h1>Online Retail Sales Dashboard</h1>
      {/* Horizontal Data Section */}
      <div className="data-summary">
        <div className="data-item">
          <FaUser className="icon" />
          <span className="number">1,012</span>
          <span className="label">Customers</span>
        </div>
        <div className="data-item">
          <FaBox className="icon" />
          <span className="number">2.2 K</span>
          <span className="label">Products</span>
        </div>
        <div className="data-item">
          <FaDollarSign className="icon" />
          <span className="number">573.3K</span>
          <span className="label">Sales</span>
        </div>
        <div className="data-item">
          <FaChartLine className="icon" />
          <span className="number">$21.2K</span>
          <span className="label">Avg Sales</span>
        </div>
      </div>

      <div className="dashboard">
  <div className="visualizations-row">
    {/* Sales by Location */}
    <div className="card map-table-container">
      <h2>Sales by Location</h2>
      <div className="map-container">
        <MapContainer
          center={[20, 0]}
          zoom={2}
          style={{
            height: "400px",
            width: "100%",
            backgroundColor: "white",
          }}
          className="map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MapCenterer markers={salesByLocation} />
          {salesByLocation.map((location, index) => {
            const { latitude, longitude, sales, Country } = location;

            if (latitude && longitude) {
              return (
                <CircleMarker
                  key={index}
                  center={[latitude, longitude]}
                  radius={Math.sqrt(sales) / 100} // Adjust radius as needed
                  fillOpacity={0.8}
                  color="blue"
                  fillColor="blue"
                  weight={1}
                >
                  <Popup>
                    {Country}: ${sales.toLocaleString()}
                  </Popup>
                </CircleMarker>
              );
            }

            return null;
          })}
        </MapContainer>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {salesByLocation.map((location, index) => (
              <tr key={index}>
                <td>{location.Country}</td>
                <td>${location.sales.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Daily Sales Trend */}
    <div className="card">
      <h2>Daily Sales Trend</h2>
      <div style={{ width: "100%", position: "relative" }}>
        <Line
          data={processDailySalesTrendData(
            dailySalesTrend,
            currentPage,
            itemsPerPage
          )}
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (context) => `${context.raw.toLocaleString()}`,
                },
              },
            },
            scales: {
              x: {
                type: "category",
                labels: processDailySalesTrendData(
                  dailySalesTrend,
                  currentPage,
                  itemsPerPage
                ).labels,
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                grid: { display: false },
              },
            },
          }}
          height={400} // Adjust height as needed
          width={600} // Adjust width as needed
        />
        <div style={{ position: "absolute", top: "498px", right: "300px" }}>
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 0}
            style={{ marginRight: "10px" }}
          >
            Previous
          </button>
          <span>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => handlePageChange("next")}
            disabled={currentPage === totalPages - 1}
            style={{ marginLeft: "10px" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>

  <div className="visualizations-row">
    {/* Top Sold Products */}
    <div className="card">
      <h2>Top Sold Products</h2>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {topSoldProducts.map((product, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "15px",
            }}
          >
            <div style={{ width: "30%", paddingRight: "20px" }}>
              <strong>{product.Description}</strong>
            </div>
            <div style={{ width: "70%" }}>
              <Bar
                data={{
                  labels: ["Sales"],
                  datasets: [
                    {
                      label: "Sales",
                      data: [product.sales],
                      backgroundColor: "rgba(54, 162, 235, 0.2)",
                      borderColor: "rgba(54, 162, 235, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  indexAxis: "y", // Horizontal bars
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (context) => `${context.raw.toLocaleString()}`,
                      },
                    },
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      grid: { display: false },
                    },
                    y: {
                      grid: { display: false },
                    },
                  },
                }}
                height={50} // Adjust height as needed
                width={300} // Adjust width as needed
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Customer Details */}
    <div className="card">
      <h2>Customer Details</h2>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Customer ID</th>
            <th>Country</th>
            <th>Latest Purchase</th>
            <th>No of Purchases</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          {customerDetails.map((customer, index) => (
            <tr key={index}>
              <td>{customer["Customer ID"]}</td>
              <td>{customer.Country}</td>
              <td>{customer["Latest purchase"]}</td>
              <td>{customer["No of Purchases"]}</td>
              <td>
                <div style={{ width: "200px", height: "50px" }}>
                  <Bar
                    data={{
                      labels: ["Sales"],
                      datasets: [
                        {
                          label: "Sales",
                          data: [customer.sales],
                          backgroundColor: "rgba(54, 162, 235, 0.2)",
                          borderColor: "rgba(54, 162, 235, 1)",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      indexAxis: "y", // Horizontal bars
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          callbacks: {
                            label: (context) => `${context.raw.toLocaleString()}`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          beginAtZero: true,
                          grid: { display: false },
                          ticks: {
                            callback: (value) => `$${value.toLocaleString()}`,
                          },
                        },
                        y: {
                          grid: { display: false },
                          ticks: {
                            callback: (value) => `$${value}`,
                          },
                        },
                      },
                    }}
                    height={50} // Adjust height as needed
                    width={200} // Adjust width as needed
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>

    </div>
  );
}

// "use client";
// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { Bar, Line } from 'react-chartjs-2';
// import 'chart.js/auto';
// import '../app/chart.css'; // Adjust the path based on your project structure

// export default function Dashboard() {
//     const [salesByLocation, setSalesByLocation] = useState([]);
//     const [topSoldProducts, setTopSoldProducts] = useState([]);
//     const [customerDetails, setCustomerDetails] = useState([]);
//     const [dailySalesTrend, setDailySalesTrend] = useState([]);
//     useEffect(() => {
//         const fetchData = async () => {
//             try {
//                 const salesByLocationResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sales_by_location`);
//                 setSalesByLocation(salesByLocationResponse.data);
//                 const topSoldProductsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/top_sold_products`);
//                 setTopSoldProducts(topSoldProductsResponse.data);
//                 const customerDetailsResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/customer_details`);
//                 setCustomerDetails(customerDetailsResponse.data);
//                 const dailySalesTrendResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/daily_sales_trend`);
//                 setDailySalesTrend(dailySalesTrendResponse.data);
//             } catch (error) {
//                 console.error("Error fetching data:", error);
//             }
//         };
//         fetchData();
//     }, []);
//     return (
//         <div className="container">
//             <h1>Online Retail Sales Dashboard</h1>
//             <div className="dashboard">
//                 <div className="card">
//                     <h2>Sales by Location (Top Locations)</h2>
//                     <Bar
//                         data={{
//                             labels: salesByLocation.map(location => location.Country),
//                             datasets: [{
//                                 label: 'Sales',
//                                 data: salesByLocation.map(location => location.sales),
//                                 backgroundColor: 'rgba(54, 162, 235, 0.2)',
//                                 borderColor: 'rgba(54, 162, 235, 1)',
//                                 borderWidth: 1
//                             }]
//                         }}
//                     />
//                 </div>
//                 <div className="card">
//                     <h2>Top Sold Products</h2>
//                     <Bar
//                         data={{
//                             labels: topSoldProducts.map(product => product.Description),
//                             datasets: [{
//                                 label: 'Sales',
//                                 data: topSoldProducts.map(product => product.sales),
//                                 backgroundColor: 'rgba(255, 99, 132, 0.2)',
//                                 borderColor: 'rgba(255, 99, 132, 1)',
//                                 borderWidth: 1
//                             }]
//                         }}
//                     />
//                 </div>
// <div className="card">
//     <h2>Customer Details</h2>
//     <table>
//         <thead>
//             <tr>
//                 <th>Customer ID</th>
//                 <th>Country</th>
//                 <th>Latest Purchase</th>
//                 <th>No of Purchases</th>
//                 <th>Sales</th>
//             </tr>
//         </thead>
//         <tbody>
//             {customerDetails.map((customer, index) => (
//                 <tr key={index}>
//                     <td>{customer['Customer ID']}</td>
//                     <td>{customer.Country}</td>
//                     <td>{customer['Latest purchase']}</td>
//                     <td>{customer['No of Purchases']}</td>
//                     <td>{customer.sales}</td>
//                 </tr>
//             ))}
//         </tbody>
//     </table>
// </div>
//                 <div className="card">
//                     <h2>Daily Sales Trend</h2>
//                     <Line
//                         data={{
//                             labels: dailySalesTrend.map(sale => sale['Invoice Date']),
//                             datasets: [{
//                                 label: 'Sales',
//                                 data: dailySalesTrend.map(sale => sale.sales),
//                                 backgroundColor: 'rgba(75, 192, 192, 0.2)',
//                                 borderColor: 'rgba(75, 192, 192, 1)',
//                                 borderWidth: 1
//                             }]
//                         }}
//                     />
//                 </div>
//             </div>
//         </div>
//     );

// }
