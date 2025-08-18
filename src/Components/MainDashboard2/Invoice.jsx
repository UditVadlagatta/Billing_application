// 2nd 


import React, { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
// import "./Style.css";

const Invoice = () => {
  const [customItem, setCustomItem] = useState({ name: "", price: "", quantity: "" });
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  // const [dueDate, setDueDate] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [discountPct, setDiscountPct] = useState(0);
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionStatus, setTransactionStatus] = useState("");
  const [error, setError] = useState("");


  const [dueDate, setDueDate] = useState("");
  const [fetchedDueDate, setFetchedDueDate] = useState(""); // New state for fetched due date
  const [invoiceId, setInvoiceId] = useState(null); // Assuming you have a way to get the invoice ID


  const subtotal = invoiceLines.reduce(
    (sum, line) => sum + Number(line.price) * Number(line.quantity),
    0
  );
  const discountAmount = subtotal * (Number(discountPct) / 100);
  const total = subtotal - discountAmount;

  // Fetch all customers
  useEffect(() => {
    fetch("http://localhost:8080/api/customers")
      .then(async (res) => {
        const text = await res.text();
        console.log("Raw response from /api/customers:", text);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}, Body: ${text}`);
        }
        return JSON.parse(text);
      })
      .then((data) => {
        console.log("Parsed customers:", data);
        setAllCustomers(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching customers:", err);
        setError("Failed to fetch customers: " + err.message);
      });
  }, []);

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then(async (res) => {
        const text = await res.text();
        console.log("Raw response from /api/products:", text);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}, Body: ${text}`);
        }
        return JSON.parse(text);
      })
      .then((data) => {
        console.log("Parsed products:", data);
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to fetch products: " + err.message);
      });
  }, []);

  // Fetch all invoices
  useEffect(() => {
    fetch("http://localhost:8080/api/invoices?page=0&size=100", {
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        const text = await res.text();
        console.log("Raw response from /api/invoices:", text);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}, Body: ${text}`);
        }
        return JSON.parse(text);
      })
      .then(async (data) => {
        const invoices = Array.isArray(data) ? data : [];
        const enrichedInvoices = await Promise.all(
          invoices.map(async (invoice) => {
            const customerResponse = await fetch(
              `http://localhost:8080/api/customers/${invoice.customer.id}`
            );
            const customerText = await customerResponse.text();
            console.log(`Raw response for customer ${invoice.customer.id}:`, customerText);
            if (!customerResponse.ok) {
              throw new Error(`Failed to fetch customer ${invoice.customer.id}: ${customerText}`);
            }
            const customer = JSON.parse(customerText);
            return {
              ...invoice,
              customerId: invoice.customer.id,
              customerName: customer.name || "",
              customerEmail: customer.email || "",
              customerPhone: customer.phone || "",
              customerAddress: customer.address || "",
              lines: invoice.items.map((item) => ({
                id: String(item.id),
                productId: item.product ? item.product.id : null,
                name: item.name || (item.product ? item.product.name : "Unknown"),
                price: item.price,
                quantity: item.quantity,
              })),
              subtotal: invoice.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              ),
              discount: invoice.discount || 0,
              total: invoice.totalAmount || total,
              status: invoice.status || "Unpaid",
              payments: invoice.payments || [],
              balanceDue: invoice.balanceDue || invoice.totalAmount || total,
              dueDate: invoice.dueDate || null,
            };
          })
        );
        setSavedInvoices(enrichedInvoices);
      })
      .catch((err) => {
        console.error("Error fetching invoices:", err);
        setError("Failed to fetch invoices: " + err.message);
      });
  }, []);

  useEffect(() => {
    // This useEffect will run once when the component mounts
    // to fetch the initial due date from the API.
    const fetchDueDate = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/invoices/duedate"); // Replace with your actual API endpoint
        if (!response.ok) {
          throw new Error("Failed to fetch due date");
        }
        const data = await response.json();
        setFetchedDueDate(data.dueDate); // Assuming the API returns an object like { "dueDate": "YYYY-MM-DD" }
      } catch (error) {
        console.error("Error fetching due date:", error);
      }
    };

    fetchDueDate();
  }, []); 


  useEffect(() => {
    // This useEffect will run when the invoiceId is available
    if (invoiceId) {
      const fetchDueDate = async () => {
        try {
          const response = await fetch(`http://localhost:8080/api/invoices/${invoiceId}/duedate`);
          if (!response.ok) {
            throw new Error("Failed to fetch due date");
          }
          const data = await response.json();
          setDueDate(data); // Set the dueDate state directly with the fetched date string
        } catch (error) {
          console.error("Error fetching due date:", error);
        }
      };
      fetchDueDate();
    }
  }, [invoiceId]); // The effect runs whenever the invoiceId changes


  // 11111111111111111111111111111111111111111111111111111111111111

  // Autocomplete: filter suggestions
  const handleNameChange = (e) => {
    const value = e.target.value;
    setCustomerName(value);
    if (value.trim().length > 0) {
      const filtered = allCustomers.filter((cust) =>
        (cust.name || "").toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Select a customer
  const handleSelectCustomer = (cust) => {
    setCustomerName(cust.name || "");
    setCustomerEmail(cust.email || "");
    setCustomerPhone(cust.phone || "");
    setCustomerAddress(cust.address || "");
    setSuggestions([]);
  };

  // Quantity changes
  const handleQuantityChange = (productId, value) => {
    const qty = value === "" ? "" : Math.max(1, Number(value));
    setQuantities((prev) => ({ ...prev, [productId]: qty }));
  };

  // Add product or custom item
  const addToInvoice = (item) => {
    if (item.id && !item.id.toString().startsWith("custom-")) {
      const raw = quantities[item.id];
      const qty = Number(raw);
      if (!qty || qty <= 0) return;
      setInvoiceLines((prev) => {
        const existing = prev.find((l) => l.productId === item.id);
        if (existing) {
          return prev.map((l) =>
            l.productId === item.id ? { ...l, quantity: Number(l.quantity) + qty } : l
          );
        }
        return [
          ...prev,
          {
            id: `temp-${Date.now()}`,
            productId: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: qty,
          },
        ];
      });
      setQuantities((prev) => ({ ...prev, [item.id]: "" }));
    } else {
      if (!item.name || !item.price || !item.quantity) return;
      setInvoiceLines((prev) => [
        ...prev,
        {
          id: `custom-${Date.now()}`,
          productId: null,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
        },
      ]);
      setCustomItem({ name: "", price: "", quantity: "" });
    }
  };

  // Print invoice
  const printInvoice = () => {
    if (!selectedInvoice) {
      alert("No invoice selected to print.");
      return;
    }
    const printContent = document.getElementById("previewArea").innerHTML;
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  // Remove a line
  const removeLine = (id) => {
    setInvoiceLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Update line quantity
  const updateLineQty = (id, qty) => {
    const quantity = Number(qty);
    if (quantity <= 0) return;
    setInvoiceLines((prev) => prev.map((l) => (l.id === id ? { ...l, quantity } : l)));
  };

  // Save invoice
  const saveInvoice = async () => {
    if (invoiceLines.length === 0) {
      alert("No items added to the invoice.");
      return;
    }
    const selectedCustomer = allCustomers.find(
      (cust) => cust.name.toLowerCase() === customerName.toLowerCase()
    );
    console.log("selectedCustomer:", selectedCustomer);
    if (!selectedCustomer || !selectedCustomer.id) {
      alert("Please select a valid customer.");
      return;
    }
    const customerId = Number(selectedCustomer.id);
    if (isNaN(customerId)) {
      console.error("Invalid customerId:", selectedCustomer.id);
      setError("Invalid customer ID. Please select a valid customer.");
      return;
    }
    const invoiceData = {
      customer: { id: customerId },
      items: invoiceLines.map((line) => ({
        product: line.productId ? { id: line.productId } : null,
        name: line.name,
        price: Number(line.price),
        quantity: Number(line.quantity),
      })),
      dueDate: dueDate || null,
      discount: discountAmount,
      totalAmount: total,
      status: "Unpaid",
      balanceDue: total,
      payments: [],
    };
    try {
      console.log("Sending invoiceData:", invoiceData);
      const response = await fetch("http://localhost:8080/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      const responseText = await response.text();
      console.log("Response from /api/invoices:", responseText, "Status:", response.status);
      if (!response.ok) {
        throw new Error(`Failed to create invoice: ${responseText}`);
      }
      const newInvoice = JSON.parse(responseText);
      const customerResponse = await fetch(
        `http://localhost:8080/api/customers/${newInvoice.customer.id}`
      );
      if (!customerResponse.ok) {
        throw new Error("Failed to fetch customer details");
      }
      const customer = await customerResponse.json();
      const enrichedInvoice = {
        ...newInvoice,
        customerId: newInvoice.customer.id,
        customerName: customer.name || "",
        customerEmail: customer.email || "",
        customerPhone: customer.phone || "",
        customerAddress: customer.address || "",
        lines: newInvoice.items.map((item) => ({
          id: String(item.id),
          productId: item.product ? item.product.id : null,
          name: item.name || (item.product ? item.product.name : "Unknown"),
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: newInvoice.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        discount: newInvoice.discount || 0,
        total: newInvoice.totalAmount || total,
        status: newInvoice.status || "Unpaid",
        payments: newInvoice.payments || [],
        balanceDue: newInvoice.balanceDue || total,
        dueDate: newInvoice.dueDate || null,
      };
      setSavedInvoices((prev) => [...prev, enrichedInvoice]);
      setInvoiceLines([]);
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setCustomerAddress("");
      setDueDate("");
      setDiscountPct(0);
      alert(`Invoice #${newInvoice.id} created successfully!`);
    } catch (err) {
      console.error("Error creating invoice:", err);
      setError(`Failed to create invoice: ${err.message}`);
    }
  };

  // Export JSON
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(savedInvoices, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "invoices.json";
    link.click();
  };

  // Filter saved invoices
  const filteredInvoices = savedInvoices.filter(
    (inv) =>
      inv.id.toString().includes(searchTerm) ||
      inv.lines.some((l) => l.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // View invoice
  const viewInvoice = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/invoices/${id}`, {
        headers: { "Content-Type": "application/json" },
      });
      const responseText = await response.text();
      console.log(`Raw response for invoice ${id}:`, responseText);
      if (!response.ok) {
        throw new Error(`Failed to fetch invoice: ${responseText}`);
      }
      const invoice = JSON.parse(responseText);
      const customerResponse = await fetch(
        `http://localhost:8080/api/customers/${invoice.customer.id}`
      );
      const customerText = await customerResponse.text();
      if (!customerResponse.ok) {
        throw new Error(`Failed to fetch customer ${invoice.customer.id}: ${customerText}`);
      }
      const customer = JSON.parse(customerText);
      const enrichedInvoice = {
        ...invoice,
        customerId: invoice.customer.id,
        customerName: customer.name || "",
        customerEmail: customer.email || "",
        customerPhone: customer.phone || "",
        customerAddress: customer.address || "",
        lines: invoice.items.map((item) => ({
          id: String(item.id),
          productId: item.product ? item.product.id : null,
          name: item.name || (item.product ? item.product.name : "Unknown"),
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: invoice.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        discount: invoice.discount || 0,
        total: invoice.totalAmount || total,
        status: invoice.status || "Unpaid",
        payments: invoice.payments || [],
        balanceDue: invoice.balanceDue || invoice.totalAmount || total,
        dueDate: invoice.dueDate || null,
      };
      setSelectedInvoice(enrichedInvoice);
      setPaymentAmount("");
      setPaymentMethod("Cash");
      setTransactionStatus("");
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Failed to fetch invoice: " + err.message);
    }
  };

  // Edit invoice
  const editInvoice = async (id) => {
    const invoiceToEdit = savedInvoices.find((inv) => inv.id === id);
    if (invoiceToEdit) {
      setCustomerName(invoiceToEdit.customerName || "");
      setCustomerEmail(invoiceToEdit.customerEmail || "");
      setCustomerPhone(invoiceToEdit.customerPhone || "");
      setCustomerAddress(invoiceToEdit.customerAddress || "");
      setInvoiceLines(invoiceToEdit.lines);
      setDiscountPct((invoiceToEdit.discount / invoiceToEdit.subtotal) * 100 || 0);
      setDueDate(invoiceToEdit.dueDate || "");
      setSavedInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setSelectedInvoice(null);
      alert(`Invoice #${id} has been loaded for editing.`);
    }
  };

  // Delete invoice
  const deleteInvoice = async (id) => {
    if (window.confirm(`Are you sure you want to delete Invoice #${id}?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/invoices/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error("Failed to delete invoice");
        }
        setSavedInvoices((prev) => prev.filter((inv) => inv.id !== id));
        setSelectedInvoice(null);
        alert(`Invoice #${id} deleted successfully.`);
      } catch (err) {
        console.error("Error deleting invoice:", err);
        setError("Failed to delete invoice: " + err.message);
      }
    }
  };

  // Record payment
  const recordPayment = async () => {
    if (!selectedInvoice) {
      alert("No invoice selected.");
      return;
    }
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    const balanceDue =
      selectedInvoice.balanceDue !== undefined ? selectedInvoice.balanceDue : selectedInvoice.total;
    if (amount > balanceDue) {
      alert("Payment amount exceeds the balance due.");
      return;
    }
    const paymentData = {
      amount,
      method: paymentMethod,
      date: new Date().toISOString().split("T")[0], // Use ISO date format
    };
    try {
      const response = await fetch(
        `http://localhost:8080/api/invoices/${selectedInvoice.id}/payments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentData),
        }
      );
      const responseText = await response.text();
      console.log(`Raw response for payment on invoice ${selectedInvoice.id}:`, responseText);
      if (!response.ok) {
        throw new Error(`Failed to record payment: ${responseText}`);
      }
      const updatedInvoice = JSON.parse(responseText);
      const customerResponse = await fetch(
        `http://localhost:8080/api/customers/${updatedInvoice.customer.id}`
      );
      const customerText = await customerResponse.text();
      if (!customerResponse.ok) {
        throw new Error(`Failed to fetch customer ${updatedInvoice.customer.id}: ${customerText}`);
      }
      const customer = JSON.parse(customerText);
      const enrichedInvoice = {
        ...updatedInvoice,
        customerId: updatedInvoice.customer.id,
        customerName: customer.name || "",
        customerEmail: customer.email || "",
        customerPhone: customer.phone || "",
        customerAddress: customer.address || "",
        lines: updatedInvoice.items.map((item) => ({
          id: String(item.id),
          productId: item.product ? item.product.id : null,
          name: item.name || (item.product ? item.product.name : "Unknown"),
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal: updatedInvoice.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),
        discount: updatedInvoice.discount || 0,
        total: updatedInvoice.totalAmount || total,
        status: updatedInvoice.status || balanceDue - amount <= 0 ? "Paid" : "Partially Paid",
        payments: updatedInvoice.payments || [],
        balanceDue: updatedInvoice.balanceDue || balanceDue - amount,
        dueDate: updatedInvoice.dueDate || null,
      };
      setSavedInvoices((prev) =>
        prev.map((inv) => (inv.id === enrichedInvoice.id ? enrichedInvoice : inv))
      );
      setSelectedInvoice(enrichedInvoice);
      setPaymentAmount("");
      setTransactionStatus(
        `Payment of ₹${amount.toFixed(2)} via ${paymentMethod} recorded successfully.`
      );
      alert(`Payment of ₹${amount.toFixed(2)} recorded for Invoice #${selectedInvoice.id}`);
    } catch (err) {
      console.error("Error recording payment:", err);
      setError("Failed to record payment: " + err.message);
    }
  };

  const renderInvoicePreview = () => {
    if (!selectedInvoice) {
      return <div className="muted">Select an invoice from the right to view or record payment.</div>;
    }
    const totalPaid = selectedInvoice.payments
    ? selectedInvoice.payments.reduce((sum, p) => sum + Number(p.amount), 0)
    : 0;
    const balanceDue = selectedInvoice.total - totalPaid;
    // Determine status based on payments
  let invoiceStatus = "Unpaid";
  if (totalPaid === 0) {
    invoiceStatus = "Unpaid";
  } else if (totalPaid >= selectedInvoice.total) {
    invoiceStatus = "Paid";
  } else if (totalPaid > 0 && totalPaid < selectedInvoice.total) {
    invoiceStatus = "Partial";
  }

    return (
      <div id="previewArea">
        <h4>Invoice #{selectedInvoice.id}</h4>
        <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
        <p><strong>Email:</strong> {selectedInvoice.customerEmail}</p>
        <p>
          <strong>Status:</strong>{" "}
          <span className={
            invoiceStatus === "Paid"
              ? "paid-status"
              : invoiceStatus === "Partial"
              ? "partial-status"
              : "unpaid-status"
          }
          >
             {invoiceStatus}
          </span>
        </p>
        {selectedInvoice.dueDate && <p><strong>Due Date:</strong> {selectedInvoice.dueDate}</p>}
      <hr />
        <h5>Items:</h5>
        <table className="invoice-lines-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Qty</th>
              <th>Price (₹)</th>
              <th>Line Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {selectedInvoice.lines.map((line) => (
              <tr key={line.id}>

                {/* <td>{`${inv.invoiceDate.day}-${inv.invoiceDate.month}-${inv.invoiceDate.year}`}</td> */}


                <td>{line.name}</td>
                <td>{line.quantity}</td>
                <td>{Number(line.price).toFixed(2)}</td>
                <td>{(Number(line.price) * line.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        {/* <p><strong>Subtotal:</strong> ₹{selectedInvoice.subtotal.toFixed(2)}</p> */}
        {/* <p><strong>Discount:</strong> ₹{selectedInvoice.discount.toFixed(2)}</p> */}
        <h2>
          <strong style={{ fontSize: "20px" }}>Total: </strong> ₹{selectedInvoice.total.toFixed(2)}
        </h2>

        {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
          <div className="payment-history">
            <hr />
            <h5>Payment Transactions:</h5>
            <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th>Amount (₹)</th>
                  <th>Mode</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{Number(payment.amount).toFixed(2)}</td>
                    <td>{payment.method}</td>
                    <td>{payment.date}</td>
                  </tr>
                  
                )
                )}
              </tbody>
            </table>
          <button onClick={printInvoice}>Download Invoice</button>  
          </div>
          
          
          
        )}
        {selectedInvoice.status !== "Paid" && (
          <div className="payment-details">
            <p><strong>Balance Due:</strong> ₹{balanceDue.toFixed(2)}</p>
            
          </div>
          
        )}
        {balanceDue > 0 && (
          <div className="payment-section">
            <input
              id="payAmt"
              type="number"
              placeholder={`Payment amount (Max: ${balanceDue.toFixed(2)})`}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <select
              id="payMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Google Pay">Google Pay</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
            <button onClick={recordPayment}>Record Payment</button>
            {(paymentMethod === "Google Pay" || paymentMethod === "PhonePe") && paymentAmount && (
              <QRCodeCanvas
                // value={`upi://pay?pa=your-upi-id@upi&pn=Your%20Name&am=${paymentAmount}&cu=INR`}
                value={`upi://pay?pa=uditvadlagatta2576@oksbi&pn=Udit%20Vadlagatta&am=${paymentAmount}&cu=INR`}

                size={128}
                style={{ marginTop: "10px" }}
              />
            )}
            <br />
            <br />
            <button onClick={printInvoice}>Download Invoice</button>
            <div style={{ color: "green", fontWeight: "bold" }}>{transactionStatus}</div>
            
          </div>
        )}
      </div>
    );
  };
   {/* Always show Download Invoice button */}
  <div style={{ marginTop: "10px" }}>
    <button onClick={printInvoice}>Download Invoice</button>
  </div>

  return (
    <div className="wrap">
      <header>
        <h1>Billing — Invoice & Payment Manager</h1>
        {error && <div className="error" style={{ color: "red" }}>{error}</div>}
      </header>
      <section className="card">
        <h3>Create / Edit Invoice</h3>
        <div style={{ position: "relative" }}>
          <label htmlFor="custName">Customer name</label>
          <input
            id="custName"
            placeholder="e.g. Rajesh Kumar"
            value={customerName}
            onChange={handleNameChange}
          />
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((cust) => (
                <li key={cust.id} onClick={() => handleSelectCustomer(cust)}>
                  {cust.name}
                </li>
              ))}
            </ul>
          )}
          



          <label htmlFor="custEmail">Customer email</label>
          <input
            id="custEmail"
            placeholder="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
          <label htmlFor="custPhone">Customer phone</label>
          <input
            id="custPhone"
            placeholder="phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
          <label htmlFor="custAddress">Customer address</label>
          <input
            id="custAddress"
            placeholder="Address"
            value={customerAddress}
            onChange={(e) => setCustomerAddress(e.target.value)}
          />
          
          
          {/* <label htmlFor="dueDate">Invoice due date</label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          /> */}

          {/* <label htmlFor="dueDate">Invoice due date</label>
    <input
      id="dueDate"
      type="date"
      value={fetchedDueDate || dueDate} // Use fetchedDueDate if available, otherwise use the user-entered dueDate
      onChange={(e) => setDueDate(e.target.value)}
    /> */}

    <label htmlFor="dueDate">Invoice due date</label>
    <input
      id="dueDate"
      type="date"
      value={dueDate}
      onChange={(e) => setDueDate(e.target.value)}
    />



        </div>
        <div>
          <h4 className="section-title">Products / Services</h4>
          <div className="products-container">
            {products.length > 0 ? (
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price (₹)</th>
                    <th>Quantity</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{Number(product.price).toFixed(2)}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={quantities[product.id] ?? ""}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        />
                      </td>
                      <td>
                        <button onClick={() => addToInvoice(product)}>Add</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No products available</p>
            )}
          </div>
          <details className="add-custom">
            <summary className="muted">Add custom item</summary>
            <div className="custom-item-form">
              <input
                type="text"
                placeholder="Name"
                value={customItem.name}
                onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                value={customItem.price}
                onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
              />
              <input
                type="number"
                placeholder="Qty"
                value={customItem.quantity}
                onChange={(e) => setCustomItem({ ...customItem, quantity: e.target.value })}
              />
              <button onClick={() => addToInvoice({ ...customItem, id: `custom-${Date.now()}` })}>
                Add
              </button>
            </div>
          </details>
          <h4 className="section-title">Invoice Lines</h4>
          {invoiceLines.length > 0 ? (
            <table className="invoice-lines-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price (₹)</th>
                  <th>Line Total (₹)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {invoiceLines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.name}</td>
                    <td style={{ width: 90 }}>
                      <input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLineQty(line.id, e.target.value)}
                      />
                    </td>
                    <td>{Number(line.price).toFixed(2)}</td>
                    <td>{(Number(line.price) * Number(line.quantity)).toFixed(2)}</td>
                    <td>
                      <button className="ghost" onClick={() => removeLine(line.id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="muted">No items added yet.</div>
          )}
          <div className="totals-row">
            <div>
              {/* <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                className="discount-input"
              /> */}
            </div>
            <div className="totals-display">
              <div className="muted">
                {/* Subtotal: <span>₹{subtotal.toFixed(2)}</span> */}
              </div>
              <div className="muted">
                {/* Discount: <span>₹{discountAmount.toFixed(2)}</span> */}
              </div>
              <div className="muted">
                Total: <strong>₹{total.toFixed(2)}</strong>
              </div>
            </div>
          </div>
          <div className="actions-row">
            <button id="saveInvoice" onClick={saveInvoice}>
              Save Invoice
            </button>
            <button
              id="newInvoice"
              className="ghost"
              onClick={() => {
                setInvoiceLines([]);
                setCustomerName("");
                setCustomerEmail("");
                setCustomerPhone("");
                setCustomerAddress("");
                setDueDate("");
                setDiscountPct(0);
                setError("");
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>


      {/* right side */}
      <aside className="card">
        <h3>Saved Invoices</h3>
        <div className="search-row">
          <input
            id="searchInv"
            placeholder="Search by item name or id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button id="exportJson" className="small" onClick={exportJson}>
            Export
          </button>
        </div>
        <div className="invoices-list" id="invoicesList">
          
          {filteredInvoices.length > 0 ? (
  filteredInvoices.map((inv) => {
    // Calculate total paid for this invoice
    const totalPaid = inv.payments
      ? inv.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      : 0;

      

    // Determine status
    let invoiceStatus = "Unpaid";
    if (totalPaid === 0) {
      invoiceStatus = "Unpaid";
    } else if (totalPaid >= inv.total) {
      invoiceStatus = "Paid";
    } else if (totalPaid > 0 && totalPaid < inv.total) {
      invoiceStatus = "Partial";
    }

    return (
      <div key={inv.id} className="invoice-card">
        <strong>Invoice #{inv.id}</strong>

        <div
          className={
            invoiceStatus === "Paid"
              ? "paid-status"
              : invoiceStatus === "Partial"
              ? "partial-status"
              : "unpaid-status"
          }
        >
          Status: {invoiceStatus}
        </div>

        <div>Customer: {inv.customerName}</div>
        <div>Total: ₹{inv.total.toFixed(2)}</div>

        <div className="invoice-actions">
          <button className="small info" onClick={() => viewInvoice(inv.id)}>
            View
          </button>
          <button className="small warning" onClick={() => editInvoice(inv.id)}>
            Edit
          </button>
          <button className="small danger" onClick={() => deleteInvoice(inv.id)}>
            Delete
          </button>
        </div>
      </div>
    );
  })
) : (
  <div className="muted">No invoices found.</div>
)}


        </div>
      </aside>
      <section className="card invoice-preview">
        <h3>Invoice Preview / Details</h3>
        <br />
        <div id="previewArea" className="preview-box">
          {renderInvoicePreview()}
        </div>
        <div id="qrcode" className="qr-area"></div>
      </section>
      <footer className="muted">
        Simple demonstrative app. Not production-ready. Use as example for learning.
      </footer>
    </div>
  );
};

export default Invoice;