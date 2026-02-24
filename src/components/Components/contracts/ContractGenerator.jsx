import jsPDF from "jspdf";
import { format } from "date-fns";

export const generateBlankContractPDF = () => {
  // Use placeholder objects for blank template
  const dummyClient = {
    full_name: "XXX",
    contract_number: "XXX",
    identification_number: "XXX",
    phone: "XXX",
    email: "XXX"
  };
  const dummySale = {
    sale_date: "XXX",
    total_price: "XXX",
    currency: "USD",
    first_installment: "XXX",
    custom_payment_plan: [] // Will fallback to dummy rows
  };
  const dummyApartment = {
    unit_number: "XXX",
    apartment_description: "XXX",
    area_sqm: "XXX",
    bedrooms: "XXX",
    block: "XXX",
    floor: "XXX",
    direction: "XXX"
  };
  
  generateContractPDF(dummySale, dummyClient, dummyApartment, true);
};

export const generateContractPDF = (sale, client, apartment, isTemplate = false) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);
  let y = 20;

  const checkPageBreak = (height = 10) => {
    if (y + height > doc.internal.pageSize.height - margin) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  const addText = (text, fontSize = 11, fontStyle = "normal", align = "left", color = "#000000") => {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach(line => {
      checkPageBreak(5);
      if (align === "center") {
        doc.text(line, pageWidth / 2, y, { align: "center" });
      } else if (align === "right") {
        doc.text(line, pageWidth - margin, y, { align: "right" });
      } else {
        doc.text(line, margin, y);
      }
      y += 6;
    });
    y += 2; // Extra spacing
  };

  const addGap = (amount = 10) => {
    y += amount;
  };

  // --- PAGE 1: TITLE PAGE ---
  
  // Logo placeholder
  doc.setFillColor(255, 100, 50); // Orange-ish
  doc.rect(margin, y, 20, 20, "F"); // Placeholder for logo
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text("ALRWID", margin + 25, y + 15);
  y += 25;

  addText("ALRWID CONSTRUCTION & CONTRACTING LTD", 14, "bold", "center");
  doc.setLineWidth(0.5);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);
  addGap(20);

  addText("ALRWID DIAMOND APARTMENT", 16, "bold", "center");
  addGap(10);
  addText("SALE AND PURCHASE AGREEMENT", 16, "bold", "center");
  addGap(10);
  addText("BY AND BETWEEN", 12, "bold", "center");
  addGap(10);
  addText("ALRWID CONSTRUCTION & CONTRACTING Ltd", 14, "bold", "center");
  addGap(5);
  addText("AND", 12, "bold", "center");
  addGap(5);
  addText(client.full_name.toUpperCase(), 14, "bold", "center");
  addGap(20);
  
  addText(`Date: ${format(new Date(), 'yyyy-MM-dd')}`, 12, "normal", "center");
  addText(`Contract No: ${client.contract_number || 'PENDING'}`, 12, "bold", "center");
  
  // Footer page 1
  y = doc.internal.pageSize.height - 30;
  doc.setFillColor(255, 100, 50); // Orange footer
  doc.rect(0, y, pageWidth, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("Tel: +250 798 696 763 / +250 792 401 540", pageWidth / 2, y + 10, { align: "center" });
  doc.text("Email: alrwid.rwanda@gmail.com / Location: Kinyinya, Gacuriro KG 414", pageWidth / 2, y + 20, { align: "center" });

  doc.addPage();
  y = 20;

  // --- PAGE 2 ---
  addText('APARTMENT (PROPERTY) SALE AND PURCHASE AGREEMENT ("THIS AGREEMENT")', 12, "bold", "left", "#000000");
  addText(`THIS AGREEMENT is dated ${format(new Date(), 'yyyy-MM-dd')}`, 11);
  addGap(5);
  
  addText("BY AND BETWEEN:", 11);
  addText("The Seller", 11, "bold");
  addText('ALRWID CONSTRUCTION AND CONTRACTING Ltd (hereinafter referred to as the "Seller"),');
  addText("Company Code: 121013696");
  addText("Tel.: +250 798696763, Alrwid.rwanda@gmail.com");
  addText("Represented by OMAR AHMAD Omar Hameshli Tel.: +250792401541");
  addGap(5);

  addText("The Buyer", 11, "bold");
  addText(`${client.full_name} (hereinafter referred to as the "Buyer"), ID No/ Passport: ${client.identification_number || '________________'}`);
  addText(`Tel: ${client.phone} Email: ${client.email || '________________'}`);
  addGap(5);
  
  addText('Seller and Buyer hereinafter collectively referred to as the "Parties" and each a "Party".');
  addGap(5);

  addText("RECITALS & DESCRIPTION.", 11, "bold", "underline");
  addText("The Seller desires to sell and the Buyer desires to buy;");
  
  const unitDesc = apartment ? `${apartment.unit_number} (${apartment.apartment_description}) units` : "________________ units";
  const aptNum = apartment ? apartment.unit_number : "________________";
  const area = apartment ? `${apartment.area_sqm} square meters` : "________________ square meters";
  const bedrooms = apartment ? `${apartment.bedrooms || '___'}-bedroom apartment` : "___-bedroom apartment";

  addText(`1. ${unitDesc}`);
  addText(`2. Apartment number ${aptNum}`);
  addText(`3. ${area} of super built area`);
  addText(`4. ${bedrooms}`);
  addGap(5);
  
  addText("Located in plot with UPI 1/02/10/01/671, located in Gacuriro Cell, Kinyinya Sector, Gasabo District, City of Kigali, and as marked in attached floor diagram (attachment #3).");
  addText(`The apartment unit # ${aptNum} to be delivered fully finished, functional with all necessary plumbing, lighting & wooden doors and AC`);
  
  addText("Apartments building amenities for residents:", 11, "bold");
  addText("Indoor parking, fully equipped gym, 4 elevators, housekeeping services, outdoor kids play area, water filtration system, cable tv, free Wi-Fi, laundry services, clubhouse, standby backup generator, fire extinguishers, 24hr CCTV surveillance.");
  addGap(5);
  
  addText("In consideration of the above recitals and of mutual agreements and covenants contained in this agreement, the Buyer and the Seller, intending to be bound legally, agree as follows:");
  
  // --- PAGE 3 ---
  addGap(10);
  addText("CLAUSE 1: PURCHASE AND SALE OF PROPERTY", 11, "bold", "underline");
  
  addText("1.1 Agreement to Sell and Buy:", 11, "bold");
  addText("Subject to the terms and conditions set forth in this Agreement the Seller hereby agrees to sell, transfer and deliver to the Buyer, and the Buyer agrees to purchase all of the Seller's rights, title and interest in and to the Property.");
  
  addText("1.2 Total Purchase Price:", 11, "bold");
  addText(`Total Purchase Price for the Property shall be ${sale?.total_price?.toLocaleString() || '___'}(${sale?.currency || 'USD'}) only and on the terms and conditions set forth in this Agreement.`);
  
  // --- PAGE 4 ---
  doc.addPage();
  y = 20;
  
  addText("1.3 Terms of Payment of Purchase Price:", 11, "bold");
  addText("Description:");
  
  // Draw Table for Description
  const tableTop = y;
  const colWidths = [20, 20, 30, 20, 30, 40]; // Adjust as needed
  const rowHeight = 10;
  
  // Table Header
  doc.setFont("helvetica", "bold");
  doc.rect(margin, y, contentWidth, rowHeight);
  doc.text(`BLOCK ${apartment?.block || '___'}`, margin + 5, y + 7);
  y += rowHeight;
  
  // Headers
  const headers = ["Floor", "Unit No", "Direction", "Area", "Cash /USD", "Description"];
  let currentX = margin;
  doc.rect(margin, y, contentWidth, rowHeight);
  headers.forEach((header, i) => {
    doc.text(header, currentX + 2, y + 7);
    currentX += (contentWidth / 6);
  });
  y += rowHeight;
  
  // Data Row
  doc.setFont("helvetica", "normal");
  currentX = margin;
  doc.rect(margin, y, contentWidth, rowHeight);
  const rowData = [
    (isTemplate ? "XXX Floor" : (apartment?.floor ? `${apartment.floor} Floor` : "___")),
    (isTemplate ? "XXX" : (apartment?.unit_number || "___")),
    (isTemplate ? "XXX" : (apartment?.direction || "___")),
    (isTemplate ? "XXX" : (apartment?.area_sqm ? `${apartment.area_sqm}` : "___")),
    (isTemplate ? "XXX" : (sale?.total_price ? `${sale.total_price}` : "___")),
    (isTemplate ? "XXX Bedroom" : (apartment?.bedrooms ? `${apartment.bedrooms} Bedroom` : "___"))
  ];
  rowData.forEach((data, i) => {
    doc.text(String(data), currentX + 2, y + 7);
    currentX += (contentWidth / 6);
  });
  y += rowHeight;
  
  // Total Row
  doc.rect(margin, y, contentWidth, rowHeight);
  doc.setFont("helvetica", "bold");
  doc.text("Total", margin + 2, y + 7);
  doc.text(`${sale?.total_price || '___'} ${sale?.currency || 'USD'}`, margin + (contentWidth / 6) * 4 + 2, y + 7);
  y += rowHeight + 10;
  
  // Installment Plan Table
  addText("Installment plan:", 11, "bold", "underline");
  
  const planHeaders = ["Instalment", "Instalment Date", `Amount ${sale?.currency || '$'}`];
  const planWidth = contentWidth / 3;
  
  // Header
  doc.setFont("helvetica", "bold");
  doc.rect(margin, y, contentWidth, rowHeight);
  planHeaders.forEach((h, i) => {
    doc.text(h, margin + (i * planWidth) + 5, y + 7);
  });
  y += rowHeight;
  
  // Default installments rows structure
  let installmentRows = [];
  
  if (isTemplate) {
      installmentRows = [
        { name: "Advance payment", date: "XXX", amount: "-" },
        { name: "First", date: "XXX", amount: "-" },
        { name: "Second", date: "XXX", amount: "-" },
        { name: "Third", date: "XXX", amount: "-" },
        { name: "Fourth", date: "XXX", amount: "-" },
        { name: "Fifth", date: "XXX", amount: "-" },
        { name: "Sixth", date: "XXX", amount: "-" },
        { name: "Seventh", date: "XXX", amount: "-" },
        { name: "Eighth", date: "XXX", amount: "-" },
      ];
  } else {
      installmentRows = [
        { name: "Advance payment (First)", date: sale?.sale_date || "___", amount: sale?.first_installment || "___" },
        ...(sale?.custom_payment_plan || []).map((p, i) => ({
            name: p.description || `Installment ${i + 2}`,
            date: p.due_date || "___",
            amount: p.amount || "___"
        })),
        ...((!sale?.custom_payment_plan || sale.custom_payment_plan.length === 0) ? [
            { name: "Second", date: "___", amount: "___" },
            { name: "Third", date: "___", amount: "___" },
            { name: "Fourth", date: "___", amount: "___" },
            { name: "Fifth", date: "___", amount: "___" },
            { name: "Sixth", date: "___", amount: "___" },
        ] : [])
      ];
  }

  doc.setFont("helvetica", "normal");
  installmentRows.forEach(row => {
    checkPageBreak(rowHeight);
    doc.rect(margin, y, contentWidth, rowHeight);
    doc.text(String(row.name), margin + 5, y + 7);
    doc.text(String(row.date), margin + planWidth + 5, y + 7);
    doc.text(String(row.amount), margin + (2 * planWidth) + 5, y + 7);
    y += rowHeight;
  });
  
  // Total Row
  doc.setFont("helvetica", "bold");
  doc.rect(margin, y, contentWidth, rowHeight);
  doc.text("TOTAL", margin + 5, y + 7);
  doc.text(`${sale?.currency || 'USD'} ${sale?.total_price || '___'}`, margin + (2 * planWidth) + 5, y + 7);
  y += rowHeight + 10;
  
  // --- PAGE 5 ---
  doc.addPage();
  y = 20;

  addText("Payment shall be made at the following bank account:");
  addText("Account Name: ALRWID CONSTRUCTION AND CONTRACTING Ltd", 11, "bold", "underline");
  addText("Bank Name: BANK OF KIGALI PLC");
  addText("Account Number (USD): 100167607289");
  addText("IBAN(USD): RW25040100167607289840");
  addText("SWIFT Code: BKIGRWRW");
  addText("Bank Address: MTN CENTER BRANCH, Kigali, Rwanda");
  addGap(5);
  
  addText("1.4. Assumption of Liabilities and Obligations of parties:", 11, "bold", "underline");
  addText("The Buyer shall not assume any obligations or liabilities of the Seller, including, without limitation (i) any obligations or liabilities under Licenses, (ii) any obligations or liabilities arising from capitalized leases or other financing agreements not assumed by the Buyer, and (iii) any tax liability whatsoever of the Seller.");
  
  addText("CLAUSE 2: SELLER'S GENERAL COVENANTS", 11, "bold", "underline");
  addText("2.1 The Seller undertakes that it shall take all reasonable steps necessary to procure that the completion date will be on 30th December, 2025.");
  addText("2.2 The Seller undertakes to cause the unit to be built substantially in accordance with the plans and in a proper and workmanlike manner in accordance with good building practice, with good and suitable materials and in accordance with requirements of all competent authorities.");
  addText("2.3 The Seller will obtain and assign to the Buyer the benefit of any manufacturer's warranties in respect of any fixtures or fittings installed by or on behalf of the Seller.");
  addText("2.4 The Seller will within a reasonable period of time rectify any defective works, fixtures and fittings in the unit (including mechanical, plumbing and electrical works) for a period of 12 months from the completion date.");
  addText("2.5 The Seller shall construct the infrastructure, roads, pathways, public lighting, water system, landscaping and facilities for the public area in accordance with development plans.");
  
  addText("CLAUSE 3. REPRESENTATION AND WARRANTIES OF THE SELLER", 11, "bold", "underline");
  addText("The Seller represents and warrants to the Buyer as set forth below.");
  
  // --- PAGE 6 ---
  addText("3.1 Authorization and Binding Obligation:", 11, "bold", "underline");
  addText("This Agreement has been duly executed and delivered by the Seller who has the powers to do so and constitutes the legal, valid, and binding obligation of the Seller, enforceable on the Seller in accordance with its terms.");
  
  addText("3.3 Title to and Condition of Property:", 11, "bold", "underline");
  addText("The Seller owns and has good title to the property, and the Property owned by the Seller is not subject to any caveat. Attached copies of Seller's land plot ownership document UPI 1/02/10/01/671 (attachment #4) & construction permit COK/BP/2023/AAK460 (attachment #5).");
  
  addText("3.4 Compliance with Laws:", 11, "bold", "underline");
  addText("The Seller is in full compliance with the Licenses and all national laws, rules, regulations, and ordinances relating to the ownership of the property sold.");
  
  addText("CLAUSE 4. REPRESENTATIONS AND WARRANTIES OF THE BUYER", 11, "bold", "underline");
  addText("The Buyer represents and warrants to the Seller as follows:");
  
  addText("4.1 Organization, Standing, and Authority:", 11, "bold", "underline");
  addText("The Buyer is validly existing, and in good standing. The Buyer has all requisite power and authority to execute and deliver this Agreement and the documents contemplated hereby, and to perform and comply with all the terms, covenants, and conditions to be performed and complied with by the Buyer under this Agreement.");
  
  addText("4.2 Authorization and Binding Obligation:", 11, "bold", "underline");
  addText("The execution, delivery, and performance by the Buyer of this Agreement and the documents contemplated hereby have been duly authorized by all necessary actions on the part of the Buyer. This Agreement has been duly executed and delivered by the Buyer and constitutes the legal, valid, and binding obligation of the Buyer, enforceable against the Buyer in accordance with its terms.");
  
  addText("4.3 Good Financial Order:", 11, "bold", "underline");
  addText("The Buyer is in good financial order and confirms that the finances used to buy the property belong to him/her and does not originate from unknown or illegal transactions.");
  
  addText("4.4 Absence of Conflicting Agreements:", 11, "bold", "underline");
  addText("The execution, delivery, and performance by the Buyer of this Agreement and the documents contemplated hereby: (i) Do not require the consent of any third party; (ii) Will not conflict with, result in a breach of, or constitute a default under any law, judgment, order, injunction, decree, rule, regulation, or ruling of any court or governmental instrumentality...");
  
  // --- PAGE 7 ---
  checkPageBreak(50);
  
  addText("4.5 Financing:", 11, "bold", "underline");
  addText("The Buyer will have on signing sufficient funds to enable him/her to consummate the transaction contemplated under this Agreement...");
  
  addText("4.6 Compliance with the law:", 11, "bold", "underline");
  addText("The Buyer from and after the acquisition of the Property shall comply and abide with the licenses and all the national laws, rules, regulations, ordinances and tax obligations relating to the ownership.");
  
  addText("CLAUSE 5. FORCE MAJEURE - EXCUSE FOR NON-PERFORMANCE", 11, "bold", "underline");
  addText("5.1 Force majeure means war, emergency, accident, fire, earthquake, flood, storm, industrial strike, pandemic or epidemic, changes in zoning regulations or other impediment...");
  addText("5.2 A party affected by force majeure shall not be deemed to be in breach of this contract, or otherwise be liable to the other...");
  addText("5.3 If any force majeure occurs in relation to either party which affects or is likely to affect the performance of any of its obligations...");
  addText("5.4 If the performance by either party of any of its obligations under this agreement is prevented or delayed by force majeure for a continuous period in excess of three months...");
  
  addText("CLAUSE 6. TERMINATION OF THE CONTRACT", 11, "bold", "underline");
  addText("6.1 In case of failure to deliver the apartment by the Seller before 30th/ December/ 2025, while the Buyer has fulfilled all obligations stipulated in this contract, the Buyer has the right to terminate the contract...");
  
  // --- PAGE 8 ---
  doc.addPage();
  y = 20;
  
  addText("CLAUSE 7. MISCELLANEOUS", 11, "bold", "underline");
  addText("7.1 Occupancy Permit and Condominium Title: The seller after fulfilling the payment by the buyer shall deliver the Occupancy Permit and Condominium Title to the buyer within 180 days after delivering the keys and apartments.");
  addText("7.2 Fees and Expenses: Unless otherwise provided in this Agreement, each party shall cover its own expenses...");
  addText("7.3 Notices: All notices, demands, and requests required or permitted to be given under the provisions of this Agreement shall be (a) in writing...");
  
  addText("To the Seller:", 11, "bold");
  addText("ALRWID CONSTRUCTION AND CONTRACTING Ltd");
  addText("Email: alrwid.rwanda@gmail.com, Tel.: +250798696763 KG414 STREET 64 GACURIRO, Gasabo District, City of Kigali");
  addGap(5);
  addText("To the Buyer:", 11, "bold");
  addText(client.full_name);
  addText(`Email: ${client.email || '___'} Tel: ${client.phone}`);
  
  addText("7.4 Benefit and Binding Effect: Neither party hereto may assign this Agreement without the prior written consent of the other party hereto...");
  addText("7.5 Entire Agreement: This Agreement and all documents, certificates, and other documents to be delivered by the parties pursuant hereto...");
  
  // --- PAGE 9 ---
  checkPageBreak(80);
  
  addText("CLAUSE 8: DISPUTES RESOLUTION PROCEDURE", 11, "bold", "underline");
  addText("8.1 Dispute: The parties shall attempt in good faith to negotiate a settlement to any dispute between them arising out of or in connection with this agreement...");
  addText("8.2 Governing Law: Questions relating to this Agreement that are not settled by the provisions contained in this agreement itself shall be governed, construed, and enforced in accordance with the laws and regulations of the Republic of Rwanda.");
  addText("8.3 Counterparts: This Agreement may be signed in counterparts each of which shall be deemed an original but all of which shall constitute one and the same document.");
  addText("8.4 Severability: To the extent any provision of this Agreement is found by a court of competent jurisdiction to be invalid or unenforceable...");
  addText("8.5 This agreement shall be performed in a spirit of good faith and fair dealing.");
  
  addGap(10);
  addText("IN WITNESS WHEREOF the parties have duly executed this Agreement as of the day and year first above written.");
  addGap(10);
  
  // Signatures
  const sigY = y;
  
  doc.text("The Seller", margin, sigY);
  doc.text("For ALRWID CONSTRUCTION AND CONTRACTING Ltd.", margin, sigY + 5);
  doc.text("Represented by", margin, sigY + 10);
  doc.text("OMAR AHMAD Omar Hameshli", margin, sigY + 15);
  doc.text("Signature: ...........................................................", margin, sigY + 30);
  
  doc.text("The Buyer", pageWidth / 2 + 10, sigY);
  doc.text(client.full_name, pageWidth / 2 + 10, sigY + 5);
  doc.text("Signature: ...........................................................", pageWidth / 2 + 10, sigY + 30);

  const filename = isTemplate 
    ? "Contract_Template.pdf" 
    : `${client.contract_number || client.full_name.replace(/\s+/g, '_')}_Contract.pdf`;
  doc.save(filename);
};