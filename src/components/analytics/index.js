import { Component } from "react";

import { ResponsiveContainer,BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend
    ,PieChart, Pie, Cell,
    LineChart, Line,
    AreaChart, Area
 } from "recharts";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "./index.css";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

class Analytics extends Component{
    state={
        start_date:"",end_date:"",
        error:"",loading:false,
        data:null
    }

    sendDates=async(e)=>{
        this.setState({loading:true});
        const{start_date,end_date}=this.state;
        if(!start_date ||!end_date){
           alert("Please select dates");
         return  this.setState({loading:false,error:""})

        }
        e.preventDefault();
        try{
            const api="https://sales-analytics-backend-daveed.onrender.com/analytics";
            const options={
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify({start_date,end_date})
            }
            const fetching=await fetch(api,options);
            if(!fetching.ok){
                throw new Error("Server error");
            }
            const data=await fetching.json();
            this.setState({data:data.data,loading:false,error:""});
            
            
        }
        catch(err){
            console.log("Error while fetching");
            this.setState({error:err.message});
        }

    }

    handleChange=(e)=>{
        this.setState({[e.target.name]:e.target.value,error:"",loading:false})
    }


      exportPDF = () => {
    const input = document.getElementById("analytics-section");
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`analytics_${this.state.start_date}_${this.state.end_date}.pdf`);
    });
  };

  
    render(){
        const{start_date,end_date,data,error,loading}=this.state;
        // Only calculate if data exists
    const categoryData = data?.category_wise_stats?.map(item => ({
        name: item.category,
        value: Number(item.revenue)
    })) || [];

    


   

        return(
            <div className="analytics">
            <div id="analytics-section">
                <h1>Sales Analytics Dashboard</h1>
                <p>Know your customer order info here...</p>
                <br/>
                <form onSubmit={this.sendDates} className="analytics-form">
                <label name="start_date">Start Date</label><br/>
                <input name="start_date" onChange={this.handleChange} value={start_date} type="date" placeholder="Select start date"/>
                <br/>
                <br/>
                <label name="end_date">End Date</label>
                <br/>
                <input name="end_date" onChange={this.handleChange} value={end_date} type="date" placeholder="Select end_date"/>
                <br/>
                {error&&<p>{error}</p>}
                <br/>
                <button className={loading?"loading":"getAnalytic"} type="submit" disabled={loading}>
                    {loading?"...Loading":"Get Analytics"}
                </button>
                </form>

                <br/>

              
                {
                    data&&(<div className="charts-container">
                        <h3>Analytics Result</h3>
                       {/* <pre>{JSON.stringify(data,null,2)}</pre> */}
                        {data && data.top_products && (
                        <div className="chart-wrapper">
                            <h3>Top Products</h3>
                            <ResponsiveContainer height={300} width="100%">
                            <BarChart width={500} height={300} data={data.top_products}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total_sold" fill="#8884d8" />
                            </BarChart>
                            </ResponsiveContainer>
                        </div>

 

                        )}

                        {data && data.region_wise_stats && (
                            <div>
                                <h3>Region Wise Revenue</h3>
                                 <ResponsiveContainer height={300} width="100%">
                                <BarChart width={500} height={300} data={data.region_wise_stats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="region" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="revenue" fill="#82ca9d" />
                                </BarChart>
                                </ResponsiveContainer>
                            </div>
                            )}




                                <div>
                                <h3>Summary</h3>
                                <p>Total Orders: {data.total_orders}</p>
                                <p>Total Revenue: {data.total_revenue}</p>
                                <p>Average Order Value: {data.average_order_value}</p>
                                </div>
                                <br/>
                         
                         <h3>Category</h3>
                         <ResponsiveContainer height={300} width="100%">
                        <PieChart width={400} height={300}>
                        <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            fill="#8884d8"
                            label
                        >
                            {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                        </PieChart>
                        </ResponsiveContainer>

                       <br/>
                        <h3>Region Wise Chart</h3>
                         <ResponsiveContainer height={300} width="100%">
                            <LineChart width={500} height={300} data={data.region_wise_stats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                        </LineChart>
                        </ResponsiveContainer>


                         <br/>
                        <ResponsiveContainer height={300} width="100%">
                          
                        <AreaChart width={500} height={300} data={data.region_wise_stats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="region" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" />
                        </AreaChart>
                        </ResponsiveContainer>
                        

                         <h3>Top Customers</h3>
                        <table>
                        <thead>
                            <tr>
                            <th>Customer</th>
                            <th>Total Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.top_customers.map(c => (
                            <tr key={c.name}>
                                <td>{c.name}</td>
                                <td>{c.total_spent}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>




                        </div>)
                }
      
                </div>

                {data && (
                    <button className="download-button" onClick={this.exportPDF}>Download PDF</button>
                )}
            </div>
         
        )
    }
}

export default Analytics;