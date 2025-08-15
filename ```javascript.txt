import React, { useEffect, useState } from "react";
import "./Style.css";

const Invoice = () => {
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [customItem, setCustomItem] = useState({ name: "", price: "", quantity: "" });

  // Customer fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  // Customer autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  // Products & quantities
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Invoice lines & totals
  const [invoiceLines, setInvoiceLines] = useState([]);
  const [discountPct, setDiscountPct] = useState(0);

  // for right side
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // New state for viewing an invoice
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // State for recording a payment
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // At the top of your component, with other state variables
const [transactionStatus, setTransactionStatus] = useState("");

  const subtotal = invoiceLines.reduce(
    (sum, line) => sum + Number(line.price) * Number(line.quantity),
    0
  );
  const discountAmount = subtotal * (Number(discountPct) / 100);
  const total = subtotal - discountAmount;

  // Fetch all customers on mount
  useEffect(() => {
    fetch("http://localhost:8080/api/customers")
      .then((res) => res.json())
      .then((data) => setAllCustomers(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching customers:", err));
  }, []);

  // Fetch products from API
  useEffect(() => {
    fetch("http://localhost:8080/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Autocomplete: filter suggestions when typing name
  const handleNameChange = (e) => {
    const value = e.target.value;
    setCustomerName(value);

    if (value.trim().length > 0) {
      const filtered = allCustomers.filter((cust) =>
        (cust.name || "")
          .toString()
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  // Autocomplete: select a customer
  const handleSelectCustomer = (cust) => {
    setCustomerName(cust.name || "");
    setCustomerEmail(cust.email || "");
    setCustomerPhone(cust.phone || "");
    setCustomerAddress(cust.address || "");
    setSuggestions([]);
  };

  // Quantity edits per product
  const handleQuantityChange = (productId, value) => {
    const qty = value === "" ? "" : Math.max(1, Number(value));
    setQuantities((prev) => ({
      ...prev,
      [productId]: qty,
    }));
  };

  // Add product or custom item to invoice
  const addToInvoice = (item) => {
    if (item.id && !item.id.toString().startsWith("custom-")) {
      const raw = quantities[item.id];
      const qty = Number(raw);
      if (!qty || qty <= 0) return;

      setInvoiceLines((prev) => {
        const existing = prev.find((l) => l.id === item.id);
        if (existing) {
          return prev.map((l) =>
            l.id === item.id
              ? { ...l, quantity: Number(l.quantity) + qty }
              : l
          );
        }
        return [
          ...prev,
          {
            id: item.id,
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
          id: item.id || `custom-${Date.now()}`,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
        },
      ]);

      setCustomItem({ name: "", price: "", quantity: "" });
    }
  };
// download
const printInvoice = () => {
  const printContent = document.getElementById("previewArea").innerHTML;
  const originalContent = document.body.innerHTML;

  // Replace body with only the preview content
  document.body.innerHTML = printContent;

  // Trigger print
  window.print();

  // Restore original content after printing
  document.body.innerHTML = originalContent;
  window.location.reload(); // reload to restore React state
};

  // Remove a line
  const removeLine = (id) => {
    setInvoiceLines((prev) => prev.filter((l) => l.id !== id));
  };

  // Update line quantity
  const updateLineQty = (id, qty) => {
    const quantity = Number(qty);
    if (quantity <= 0) return;
    setInvoiceLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, quantity } : l))
    );
  };

  // Save Invoice
  const saveInvoice = () => {
    if (invoiceLines.length === 0) return;
    const newInvoice = {
      id: Date.now(),
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      lines: invoiceLines,
      status: "Unpaid", // Add a status to the new invoice
      subtotal: subtotal,
      discount: discountAmount,
      total: total,
    };
    setSavedInvoices((prev) => [...prev, newInvoice]);
    setInvoiceLines([]);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerAddress("");
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
      inv.lines.some((l) =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const markAsPaid = (id) => {
    setSavedInvoices(prev =>
      prev.map(inv =>
        inv.id === id ? { ...inv, status: 'Paid' } : inv
      )
    );
  };

  const viewInvoice = (id) => {
    const invoice = savedInvoices.find(inv => inv.id === id);
    setSelectedInvoice(invoice);
    // Reset payment form when viewing a new invoice
    setPaymentAmount("");
    setPaymentMethod("Cash");
  };

  const editInvoice = (id) => {
    const invoiceToEdit = savedInvoices.find(inv => inv.id === id);
    if (invoiceToEdit) {
      setCustomerName(invoiceToEdit.customerName || "");
      setCustomerEmail(invoiceToEdit.customerEmail || "");
      setCustomerPhone(invoiceToEdit.customerPhone || "");
      setCustomerAddress(invoiceToEdit.customerAddress || "");
      setInvoiceLines(invoiceToEdit.lines);
      setSavedInvoices(prev => prev.filter(inv => inv.id !== id));
      setSelectedInvoice(null); // Clear preview when editing
      alert(`Invoice #${id} has been loaded for editing.`);
    }
  };

  const deleteInvoice = (id) => {
    if (window.confirm(`Are you sure you want to delete Invoice #${id}?`)) {
      setSavedInvoices(prev => prev.filter(inv => inv.id !== id));
      setSelectedInvoice(null); // Clear preview if deleted invoice was selected
    }
  };

  const recordPayment = () => {
    if (!selectedInvoice) {
      alert("No invoice selected.");
      return;
    }
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    const newBalance = (selectedInvoice.balanceDue || selectedInvoice.total) - amount;

    if (newBalance < 0) {
        alert("Payment amount exceeds the balance due.");
        return;
    }
    // setTransactionStatus(`Payment of ₹${amount.toFixed(2)} recorded successfully.`);
    setPaymentAmount("");


    const updatedInvoice = {
        ...selectedInvoice,
        status: newBalance <= 0 ? 'Paid' : 'Partially Paid',
        balanceDue: newBalance,
        payments: [
            ...(selectedInvoice.payments || []),
            {
              id: Date.now(), // Unique ID for each payment
                amount: amount,
                method: paymentMethod,
                date: new Date().toLocaleDateString(),
            },
        ],

    };

    // Update the savedInvoices list with the new details
    setSavedInvoices(prev =>
      prev.map(inv =>
        inv.id === updatedInvoice.id ? updatedInvoice : inv
      )
    );

    // Update the currently viewed invoice in state
    setSelectedInvoice(updatedInvoice);
    setPaymentAmount("");
    setTransactionStatus(`Payment of ₹${amount.toFixed(2)} via ${paymentMethod} recorded successfully.`);

    alert(`Payment of ₹${amount.toFixed(2)} recorded for Invoice #${selectedInvoice.id}`);
  };

  const renderInvoicePreview = () => {
    if (!selectedInvoice) {
      return (
        <div className="muted">
          Select an invoice from the right to view or record payment.
        </div>
      );
    }
    const balanceDue = selectedInvoice.balanceDue !== undefined 
      ? selectedInvoice.balanceDue 
      : selectedInvoice.total;
    return (
      <div>
        <h4>Invoice #{selectedInvoice.id}</h4>
        <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
        <p><strong>Email:</strong> {selectedInvoice.customerEmail}</p>
        <p><strong>Status:</strong> <span className={selectedInvoice.status === 'Paid' ? 'paid-status' : 'unpaid-status'}>{selectedInvoice.status}</span></p>
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
                <td>{line.name}</td>
                <td>{line.quantity}</td>
                <td>{line.price.toFixed(2)}</td>
                <td>{(line.quantity * line.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <p><strong>Subtotal:</strong> ₹{selectedInvoice.subtotal.toFixed(2)}</p>
        <p><strong>Discount:</strong> ₹{selectedInvoice.discount.toFixed(2)}</p>
        <h2><strong style={{ fontSize: "20px" }}>Total: </strong> ₹{selectedInvoice.total.toFixed(2)}</h2>


        {/* <div> payment transtaction status</div> */}
        {/* This is the new div for the transaction status */}
    {/* <div className="payment-transaction-status" style={{ color: "green", fontWeight: "bold" }}>
        {transactionStatus}
    </div> */}
    {/* Display list of payments if they exist */}
            {selectedInvoice.payments && selectedInvoice.payments.length > 0 && (
                <div className="payment-history">
                    <hr />
                    <h5>Payment Transactions:</h5>
                    {/* <ul>
                        {selectedInvoice.payments.map(payment => (
                            <li key={payment.id}>
                                <strong>₹{payment.amount.toFixed(2)}</strong> via {payment.method} on {payment.date}
                            </li>
                        ))}
                    </ul> */}
                    <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
  <thead>
    <tr>
      <th>Amount (₹)</th>
      <th>Mode</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    {selectedInvoice.payments.map(payment => (
      <tr key={payment.id}>
        <td>{payment.amount.toFixed(2)}</td>
        <td>{payment.method}</td>
        <td>{payment.date}</td>
      </tr>
    ))}
  </tbody>
</table>
                </div>
            )}
            
            {/* Display balance due and payment form */}
            {selectedInvoice.status !== 'Paid' && (
                <div className="payment-details">
                    <p><strong>Balance Due:</strong> ₹{balanceDue.toFixed(2)}</p>
                </div>
            )}
            
            <div className="payment-section">
                {balanceDue > 0 ? (
                    <>
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
                        <br />
                        <div style={{ color: "green", fontWeight: "bold" }}>{transactionStatus}</div>
                        <img src="" alt="Payment Image" ></img>
                        <button onClick={printInvoice}>Download Invoice</button>

                    </>
                ) : (
                    <div className="paid-message">
                        This invoice has been marked as paid.
                        <br />
                        <button onClick={printInvoice}>Download Invoice</button>

                    </div>
                )}
            </div>
        <br />
        <div>
          {/* {selectedInvoice.status === 'Unpaid' ? (
            <>
              <input 
                id="payAmt" 
                type="number" 
                placeholder="Payment amount"
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
              <br />
              <img src="" alt="Payment Image" ></img>
              <button onClick={() => window.print()}>Download Invoice</button>
            </>
          ) : (
            <div className="paid-message">
              This invoice has been marked as paid.
              <br />
              <button onClick={() => window.print()}>Download Invoice</button>
            </div>
          )} */}

          {/* {selectedInvoice.status !== 'Paid' && (
                <div className="payment-details">
                    <p><strong>Balance Due:</strong> ₹{balanceDue.toFixed(2)}</p>
                </div>
            )} */}
            
            {/* <div className="payment-section">
                {balanceDue > 0 ? (
                    <>
                        <input 
                            id="payAmt" 
                            type="number" 
                            placeholder="Payment amount"
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
                        <br />
                        <img src="" alt="Payment Image" ></img>
                        <button onClick={() => window.print()}>Download Invoice</button>
                    </>
                ) : (
                    <div className="paid-message">
                        This invoice has been marked as paid.
                        <br />
                        <button onClick={() => window.print()}>Download Invoice</button>
                    </div>
                )}
            </div> */}
            
        </div>
      </div>
    );
  };

  return (
    <div className="wrap">
      <header>
        <h1>Billing — Invoice & Payment Manager</h1>
        <div className="muted">Data stored in your browser (localStorage).</div>
      </header>

      {/* LEFT: Create / Edit Invoice */}
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
          <label htmlFor="dueDate">Invoice due date</label>
          <input id="dueDate" type="date" />
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
                      <td>{product.price}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={quantities[product.id] ?? ""}
                          onChange={(e) =>
                            setQuantities({ ...quantities, [product.id]: e.target.value })
                          }
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
                    <td>
                      {(Number(line.price) * Number(line.quantity)).toFixed(2)}
                    </td>
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
              <label htmlFor="discount">Discount (%)</label>
              <input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={discountPct}
                onChange={(e) => setDiscountPct(e.target.value)}
                className="discount-input"
              />
            </div>
            <div className="totals-display">
              <div className="muted">Subtotal: <span>{subtotal.toFixed(2)}</span></div>
              <div className="muted">
                Discount: <span>-{discountAmount.toFixed(2)}</span>
              </div>
              <div className="muted">
                Total: <strong>{total.toFixed(2)}</strong>
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
                setDiscountPct(0);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* RIGHT: Saved invoices */}
      <aside className="card">
        <h3>Saved Invoices</h3>
        <div className="search-row">
          <input
            id="searchInv"
            placeholder="Search by item name or id"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button id="exportJson" className="small" onClick={exportJson}>Export</button>
        </div>
        <div className="invoices-list" id="invoicesList">
          {filteredInvoices.length > 0 ? (
            filteredInvoices.map((inv) => (
              <div key={inv.id} className="invoice-card">
                <strong>Invoice #{inv.id}</strong>
                <div className={inv.status === 'Paid' ? 'paid-status' : 'unpaid-status'}>Status: {inv.status}</div>
                <div>Customer: {inv.customerName}</div>
                <div>Total: ₹{inv.total.toFixed(2)}</div>
                <div className="invoice-actions">
                  <button className="small info" onClick={() => viewInvoice(inv.id)}>View</button>
                  <button className="small warning" onClick={() => editInvoice(inv.id)}>Edit</button>
                  <button className="small danger" onClick={() => deleteInvoice(inv.id)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="muted">No invoices found.</div>
          )}
        </div>
      </aside>
{/* ------------------------------------------------------------------------------------------------------- */}
      {/* Invoice Preview / Details */}
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

const CustomItem = ({ onAdd }) => {
  const [desc, setDesc] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");

  const add = () => {
    const q = Number(qty);
    const p = Number(price);
    if (!desc.trim() || !q || !p) return;
    onAdd({ id: `custom-${Date.now()}`, name: desc, price: p, quantity: q });
    setDesc(""); setQty(""); setPrice("");
  };

  return (
    <div>
      <input
        id="customDesc"
        placeholder="Description"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
      />
      <div className="custom-inputs">
        <input
          id="customQty"
          type="number"
          min="1"
          placeholder="Qty"
          className="qty-input"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <input
          id="customPrice"
          type="number"
          min="0"
          placeholder="Price"
          className="price-input"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
        <button id="addCustom" onClick={add}>Add</button>
      </div>
    </div>
  );
};

export default Invoice;