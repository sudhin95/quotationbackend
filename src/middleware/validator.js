const Validator = require("fastest-validator");
const v = new Validator();
const email = {
  $$root: true,
  type: "email",
  min: 3,
  max: 200,
};
const password0 = {
  $$root: true,
  type: "string",
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*d)[0-9a-zA-Z*#]{8,16}$",
};
// const password = {
//   $$root: true,
//   type: "string",
//   pattern: "^(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{8,16})$",
// };
// new password
const password = {
  $$root: true,
  type: "string",
  pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#!]).{8,16}$",
};
const passwordmobile = {
  $$root: true,
  type: "string",
  pattern: /^(?!.*\s)(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,25}$/,
  // pattern :"/^(?!.*['\s])(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).{8,25}$/",
};
const name = {
  $$root: true,
  type: "string",
  pattern: /^(?:[A-Z]|[a-z]{3})[0-9a-zA-Z\- ,.\(\)\{\}&\s]+(?!_)$/,
};
const lastname = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z ,.-_\\s?!]+$",
  max: 200,
};
const mobile = {
  $$root: true,
  type: "number",
  pattern: "^[0-9-\\s]{10,16}$",
};
const alphanum = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z ,.-_\\s?!]+$",
  max: 200,
};
const alphanumonly = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z,'\\/\\s]+$",  // Added ' to the character set
  max: 200,
};
const zip = {
  $$root: true,
  type: "number",
  pattern: "^[1-9][0-9]{5}$",
};
const url = {
  $$root: true,
  type: "url",
};
const amount = {
  $$root: true,
  type: "number",
  pattern: "^[-]?[0-9.]+$",
};
const number = {
  $$root: true,
  type: "number",
  pattern: "^[-]?[0-9]+$",
};
const dob = {
  $$root: true,
  type: "date",
  // convert: true
  pattern: "^([0-9]{2})-([0-9]{2})-([0-9]{4})$",
};
const dob_ymd = {
  $$root: true,
  type: "string",
  // numeric:true,
  pattern: "^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})$",
};
const alphanumdesc = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z-_ ,.\\s?!&]+$",
};
const alphanumdesc0 = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z-_ ,.\\s?!()]+$",
  // pattern:"^[0-9a-zA-Z ,.-_\\s]+\$",
};
const zipdesc = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z-!]+$",
  // pattern:"^[0-9a-zA-Z ,.-_\\s]+\$",
};
const alphanumcomalpha = {
  $$root: true,
  type: "string",
  pattern: "^(?:[A-Z]|[a-z]{1,2})[0-9a-zA-Z-_ ,.\\s?!]+$",
  // pattern:"^[0-9a-zA-Z ,.-_\\s]+\$",
};
const mobileno = {
  $$root: true,
  type: "string",
  pattern: "^[0-9-\\s]{10,16}$",
};
const alphanumregname = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z-_ -#@.\\s?!]+$",
  // pattern:"^[0-9a-zA-Z ,.-_\\s]+\$",
};
const couponcode = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z \\s]+$",
  max: 200,
  min: 3,
};
const mobile_no = {
  $$root: true,
  type: "number",
  pattern: "^(?:[0-9-\\s]*[0-9]){9,16}$",
};
const postivenumber = {
  $$root: true,
  type: "number",
  pattern: "^[0-9]+$",
};
const addressPattern = {
  $$root: true,
  type: "string",
  pattern: "^[0-9a-zA-Z,'./\\s_()-]+$", // Allows letters, numbers, spaces, commas,
  // quotes, slashes, underscores, hyphens, and parentheses in the string
  max: 200,
};
const customertype = {
  $$root: true,
  type: "string",
  pattern: /^(?![*{}<>#@\$%\/])[a-zA-Z0-9()&,\s'-]+$/, // Allows
};
const groupterritory = {
  $$root: true,
  type: "string",
  pattern:  /^(?![*{}<>#@\$%\/])[a-zA-Z0-9()‘&,\s'-]+$/, // Allows
};
const fname = {
  $$root: true,
  type: "string",
  pattern: /^(?![*{}<>#@\$%\/])[-a-zA-Z0-9 ,.\(\)\[\]&\s]+$/,
  max: 100
};
const gender = {
  $$root: true,
  type: "string",
  pattern: "^[a-zA-Z]+$",
};
const address = {
  $$root: true,
  type: "string",
  pattern: /^(?![*{}<>#@\$%\/])[-a-zA-Z0-9 ,.\(\)\[\]&\/\s]+$/, // Allows ,
  max: 200
};
const city = {
  $$root: true,
  type: "string",
  pattern: /^(?![*{}<>#@\$%\/])[-a-zA-Z0-9(),.&\s]+$/, // Allows ,
};
const mob = {
  $$root: true,
  type: "number",
  pattern: /^\d{10,16}$/, // Allows ,
};
const alphabets = {
  $$root: true,
  type: "string",
  pattern: "^[a-zA-Z]+$", // Allows ,
};
const productcat = {
  $$root: true,
  type: "string",
  pattern: /^(?![*{}<>#@\$%\/])[-a-zA-Z0-9 .\(\)\[\]&\/\s]+$/, // Allows ,
  max: 100
};
const check_email = v.compile(email);
const check_password = v.compile(password);
const check_password_mobile = v.compile(passwordmobile);
const check_aplha = v.compile(alphanumdesc0);
const check_postivenumber = v.compile(postivenumber);
const check_name = v.compile(name);
const check_mobile = v.compile(mobile);
const check_alphanum = v.compile(alphanum);
const check_alphanumonly = v.compile(alphanumonly);
const check_zip = v.compile(zip);
const check_url = v.compile(url);
const check_amount = v.compile(amount);
const check_number = v.compile(number);
const check_dob = v.compile(dob);
const check_dobymd = v.compile(dob_ymd);
const check_alphanumdesc = v.compile(alphanumdesc);
const check_alphanumcomalpha = v.compile(alphanumcomalpha);
const check_mobileno = v.compile(mobileno);
const check_merchantname = v.compile(alphanumregname);
const check_lastname = v.compile(lastname);
const check_zipdesc = v.compile(zipdesc);
const check_couponcode = v.compile(couponcode);
const check_phoneno = v.compile(mobile_no);
const check_addressPattern = v.compile(addressPattern);
const check_customertype = v.compile(customertype);
const check_group_territory = v.compile(groupterritory);
const check_fname = v.compile(fname);
const check_gender = v.compile(gender);
const check_address = v.compile(address);
const check_city = v.compile(city);
const check_mob = v.compile(mob);
const check_alpha = v.compile(alphabets);
const check_productcategory = v.compile(productcat);
module.exports = {
  check_email,
  check_password,
  check_password_mobile,
  check_name,
  check_mobile,
  check_alphanum,
  check_alphanumonly,
  check_zip,
  check_url,
  check_amount,
  check_number,
  check_dob,
  check_dobymd,
  check_alphanumdesc,
  check_alphanumcomalpha,
  check_mobileno,
  check_merchantname,
  check_lastname,
  check_zipdesc,
  check_couponcode,
  check_phoneno,
  check_aplha,
  check_postivenumber,
  check_addressPattern,
  check_customertype,
  check_group_territory,
  check_fname,
  check_gender,
  check_address,
  check_city,
  check_mob,
  check_alpha,
  check_productcategory
};