// SalesByLocation.js
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTable } from 'react-table';

const SalesByLocation = ({ salesByLocation }) => {
    const columns = React.useMemo(
        () => [
            { Header: 'Country', accessor: 'Country' },
            { Header: 'Sales', accessor: 'sales' },
        ],
        []
    );

    const data = React.useMemo(() => salesByLocation, [salesByLocation]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

    return (
        <div className="sales-by-location">
            <h2>Sales by Location (Top Locations)</h2>
            <div className="map-and-table">
                <MapContainer center={[20, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="© <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                    />
                    {salesByLocation.map((location, index) => (
                        <CircleMarker
                            key={index}
                            center={[location.lat, location.lng]}
                            radius={10}
                            color="blue"
                            fillColor="blue"
                            fillOpacity={0.5}
                        >
                            <Popup>
                                {location.Country}: {location.sales}
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
                <table {...getTableProps()} className="top-locations-table">
                    <thead>
                        {headerGroups.map(headerGroup => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map(row => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map(cell => (
                                        <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SalesByLocation;
