const util = require("util");
const multer = require("multer");
const maxSize = 30 * 1024 * 1024;
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/auth");
const functionClass = require("../middleware/functions");

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const filesDir = "webroot/uploads/rightsidefiles/";
    // check if directory exists
    if (!fs.existsSync(filesDir)) {
      // if not create directory
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
    // cb(null, "webroot/uploads/rightsidefiles/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
let uploadFile = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("file");
let uploadDocs = util.promisify(uploadFile);
let storageB = multer.diskStorage({
  destination: (req, file, cb) => {
    const filesDir = "webroot/uploads/redeembenefits/";
    // check if directory exists
    if (!fs.existsSync(filesDir)) {
      // if not create directory
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
    // cb(null, "webroot/uploads/redeembenefits/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
let uploadFileB = multer({
  storage: storageB,
  limits: { fileSize: maxSize },
}).single("file");
uploadBenefits = util.promisify(uploadFileB);
let storageC = multer.diskStorage({
  destination: (req, file, cb) => {
    const filesDir = "webroot/uploads/excelqrcodes/";
    // check if directory exists
    if (!fs.existsSync(filesDir)) {
      // if not create directory
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
    // cb(null, "webroot/uploads/excelqrcodes/");
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    cb(null, Date.now() + "_" + file.originalname.replace(/ /g, "-"));
  },
});
let uploadFileC = multer({
  storage: storageC,
  fileFilter: function (req, file, cb) {
    console.log(file);
    var ext = path.extname(file.originalname);
    if (ext !== ".xlsx" && ext !== ".xls") {
      return cb("Only Excel documents are allowed", file.originalname);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
}).single("file");
let upload_qr_fileC = multer({
  storage: storageC,
  fileFilter: function (req, file, cb) {
    console.log(file);
    var ext = path.extname(file.originalname);
    if (ext !== ".csv") {
      return cb("Only CSV documents are allowed", file.originalname);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
}).single("file");
uploadQrCode = util.promisify(upload_qr_fileC);
let storageD = multer.diskStorage({
  destination: (req, file, cb) => {
    const filesDir = "webroot/uploads/";
    // check if directory exists
    if (!fs.existsSync(filesDir)) {
      // if not create directory
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
    // cb(null, "webroot/uploads/");
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    cb(null, Date.now() + "_" + file.originalname.replace(/ /g, "-"));
  },
});
let uploadFileD = multer({
  storage: storageD,
  fileFilter: function (req, file, cb) {
    // console.log("Sss"); return false;
    var ext = path.extname(file.originalname);
    if (ext !== ".xlsx" && ext !== ".xls") {
      return cb("Only Excel documents are allowed", file.originalname);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
}).single("file");
uploadLogo = util.promisify(uploadFileD);
//profile image upload
let storageProfileImg = multer.diskStorage({
  destination: async (req, file, cb) => {
    var tenantidenc = functionClass.encrypt(authMiddleware.tenantId);
    console.log(tenantidenc);
    var custencid = req.params.customerId;
    var custid = functionClass.decrypt(custencid);
    const filestenantDir = "webroot/uploads/" + tenantidenc;
    // check if directory exists
    if (!fs.existsSync(filestenantDir)) {
      // if not create directory
      fs.mkdirSync(filestenantDir);
    }
    const filesDir = "webroot/uploads/" + tenantidenc + "/customerprofile";
    // check if directory exists
    if (!fs.existsSync(filesDir)) {
      // if not create directory
      fs.mkdirSync(filesDir);
    }
    var sUserProfileImage = await functionClass.getNames(
      authMiddleware.dbKey,
      `lty_loyaltycustomers`,
      `sUserProfileImage`,
      `iTenantId='${authMiddleware.tenantId}' AND id='${custid}' `
    );
    if (sUserProfileImage != "") {
      const profileimagepath =
        "webroot/uploads/" +
        tenantidenc +
        "/customerprofile/" +
        sUserProfileImage;
      fs.unlink(profileimagepath, (err) => {
        if (err) {
          console.log(err);
        } else {
        }
      });
    }
    cb(null, filesDir);
  },
  filename: (req, file, cb) => {
    var custencid = req.params.customerId;
    var ext = path.extname(file.originalname);
    cb(null, custencid + "_" + file.originalname.replace(/ /g, "-"));
  },
});
let uploadFileProfileImg = multer({
  storage: storageProfileImg,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png") {
      console.log("VVL");
      return cb("Only jpg,jpeg and png are allowed", file.originalname);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
}).single("file");
let uploadProfileImg = util.promisify(uploadFileProfileImg);
let storageCorp = multer.diskStorage({
  destination: (req, file, cb) => {
    const md5 = require("md5");
    var merFolder = authMiddleware.baseFolder;
  
    const filesDirRoot = "webroot/uploads/" + merFolder;
    if (!fs.existsSync(filesDirRoot)) {
      fs.mkdirSync(filesDirRoot);
      const filesDir = "webroot/uploads/" + merFolder + "/corporatelogo";
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
      }
      cb(null, filesDir);
    } else {
      const filesDir = "webroot/uploads/" + merFolder + "/corporatelogo";
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
      }
      cb(null, filesDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});




let uploadFileCorpoImg = multer({
  storage: storageCorp,
  limits: { fileSize: maxSize },
}).single("file");
let uploadCorpoImg = util.promisify(uploadFileCorpoImg);
let storageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    const md5 = require("md5");
    var merFolder = authMiddleware.baseFolder;
    var useridenc = functionClass.encrypt(authMiddleware.userId);
    const filesDirRoot = "webroot/uploads/clients";
    const filesDirRoot_UserProfile =
      "webroot/uploads/clients";
    if (!fs.existsSync(filesDirRoot)) {
      fs.mkdirSync(filesDirRoot);
    }
    if (!fs.existsSync(filesDirRoot_UserProfile)) {
      fs.mkdirSync(filesDirRoot_UserProfile);
    }
    const filesDir =
      "webroot/uploads/clients" + useridenc;
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});





/* Image upload */
let uploadFileUserProfileImg = multer({
  storage: storageUser,
  limits: { fileSize: maxSize },
}).single("file");
let uploadUserProfileImg = util.promisify(uploadFileUserProfileImg);


let storagegift = multer.diskStorage({
  
  destination: (req, file, cb) => {
    const md5 = require("md5");
    var merFolder = authMiddleware.baseFolder;
    const filesDirRoot = "webroot/uploads/" + merFolder;
    console.log(filesDirRoot)
    if (!fs.existsSync(filesDirRoot)) {
      fs.mkdirSync(filesDirRoot);
      const filesDir = "webroot/uploads/" + merFolder + "/giftitemImages";
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
      }
      cb(null, filesDir);
    } else {
      const filesDir = "webroot/uploads/" + merFolder + "/giftitemImages";
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
      }
      cb(null, filesDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
let uploadFileGiftImg = multer({
  storage: storagegift,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("file");
let uploadGiftImg = util.promisify(uploadFileGiftImg);

// product catalog
let storagecatalog = multer.diskStorage({
  destination: (req, file, cb) => {
    const md5 = require("md5");
    var merFolder = authMiddleware.baseFolder;
    const filesDirRoot = "webroot/uploads/" + merFolder;
    console.log(filesDirRoot)
    if (!fs.existsSync(filesDirRoot)) {
      fs.mkdirSync(filesDirRoot);
      const filesDir = "webroot/uploads/" + merFolder + "/productcatalogImages";
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
      }
      cb(null, filesDir);
    } else {
      const filesDir = "webroot/uploads/" + merFolder + "/productcatalogImages";
      if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
      }
      cb(null, filesDir);
    }
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
let uploadFileCatalogImg = multer({
  storage: storagecatalog,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("file");
let uploadCatalogImg = util.promisify(uploadFileCatalogImg);

// product catalog end



let storageAlert = multer.diskStorage({
  destination: (req, file, cb) => {
    // console.log('console<<<>>>',req)
    const md5 = require("md5");
    var merFolder = authMiddleware.baseFolder;
    var useridenc = functionClass.encrypt(authMiddleware.userId);
    const filesDirRoot = "webroot/uploads/" + merFolder;
    const filesDirRoot_UserProfile =
      "webroot/uploads/" + merFolder + "/useralertimage";
    if (!fs.existsSync(filesDirRoot)) {
      fs.mkdirSync(filesDirRoot);
    }
    if (!fs.existsSync(filesDirRoot_UserProfile)) {
      fs.mkdirSync(filesDirRoot_UserProfile);
    }
    const filesDir =
    "webroot/uploads/" + merFolder + "/useralertimage";
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir);
    } 
    cb(null, filesDir);
  },
  
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
   
});
let uploadFileAlertImg = multer({
  storage: storageAlert,
  limits: { fileSize: maxSize },
}).single("file");

let uploadAlertImg = util.promisify(uploadFileAlertImg);


// //
let storageExcel = multer.diskStorage({
  destination: (req, file, cb) => {
    const filesDir = "webroot/uploads/fileimport/";
    // check if directory exists
    if (!fs.existsSync(filesDir)) {
      // if not create directory
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
    // cb(null, "webroot/uploads/excelqrcodes/");
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    cb(null, file.originalname.replace(/ /g, "-"));
  },
});

let upload_exceldata = multer({
  storage: storageExcel,
  fileFilter: function (req, file, cb) {
    console.log("!!",file);
    var ext = path.extname(file.originalname);
    if (ext !== ".csv" && ext !== ".xls" &&  ext !== ".xlsx") {
      return cb("Only spreadsheet documents are allowed", file.originalname);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
}).single("file");

uploadtoPy = util.promisify(upload_exceldata);




// let uploadCsvFile = multer({
//   // storage: storageProfileImg,
//   fileFilter: function (req, file, cb) {
//     console.log(req); return false
   
//     cb(null, true);
//   },
//   limits: { fileSize: maxSize },
// }).single("file");


let update_file = multer.diskStorage({
  destination: (req, file, cb) => {
    const filesDir = "webroot/uploads/fileupdate/";
    // check if directory exists
    if (!fs.existsSync(filesDir)) {
      // if not create directory
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
    // cb(null, "webroot/uploads/excelqrcodes/");
  },
  filename: (req, file, cb) => {
    // cb(null, file.originalname);
    cb(null, file.originalname.replace(/ /g, "-"));
  },
});

let upload_update_file = multer({
  storage: update_file,
  fileFilter: function (req, file, cb) {
    var ext = path.extname(file.originalname);
    if (ext !== ".csv" && ext !== ".xls" &&  ext !== ".xlsx") {
      return cb("Only spreadsheet documents are allowed", file.originalname);
    }
    cb(null, true);
  },
  limits: { fileSize: maxSize },
}).single("file");

uploadUpdateFile = util.promisify(upload_update_file);
module.exports = {
  uploadDocs,
  uploadBenefits,
  uploadQrCode,
  uploadLogo,
  uploadProfileImg,
  uploadCorpoImg,
  uploadUserProfileImg,
  uploadGiftImg,
  uploadAlertImg,
  uploadCatalogImg,
  uploadtoPy,
  uploadUpdateFile
  
};