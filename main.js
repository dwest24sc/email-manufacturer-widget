console.log("main.js is running");

ZOHO.embeddedApp.on("PageLoad", async function(data) {
  console.log("PageLoad event triggered:", data);

  await ZOHO.CRM.init();

  try {
    const recordId = data.EntityId;
    console.log("Record ID:", recordId);

    const salesOrderResp = await ZOHO.CRM.API.getRecord({
      Entity: "Sales_Orders",
      RecordID: recordId,
    });

    const salesOrder = salesOrderResp.data[0];
    const subject = salesOrder.Subject || "Sales Order";
    const manufacturerField = salesOrder.Manufacturer;

    if (!manufacturerField || !manufacturerField.name) {
      alert("No Manufacturer selected on this Sales Order.");
      return;
    }

    const searchResp = await ZOHO.CRM.API.searchRecord({
      Entity: "Manufacturers",
      Type: "criteria",
      Query: `(Name:equals:${manufacturerField.name})`
    });

    const manufacturer = searchResp.data?.[0];
    const emailTo = manufacturer?.PO_Email;

    if (!emailTo) {
      alert("Manufacturer PO_Email not found.");
      return;
    }

    await ZOHO.CRM.API.composeEmail({
      to: emailTo,
      subject: `${subject} New Order`,
      message: "Dear Manufacturer,\n\nPlease find the Sales Order attached.\n\nRegards,\nYour Team",
      entityId: recordId,
      module: "Sales_Orders"
    });

    ZOHO.CRM.UI.Popup.close();
  } catch (err) {
    console.error("Error:", err);
    alert("Failed to prepare email.");
  }
});

ZOHO.embeddedApp.init();
