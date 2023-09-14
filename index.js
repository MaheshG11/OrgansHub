//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const password = "shreyansh";


//   bcrypt
//   .compare(password, a)
//   .then(res => {
//     console.log("Matching") // return true
//   })
//   .catch(err => console.error(err.message))

app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: "secret"
}));

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));


mongoose.set("strictQuery",false);
mongoose.connect("mongodb+srv://indros0603:chIDkDUjLGg7HLHY@cluster0.ntmh4fz.mongodb.net/OrganHubDB",{ useNewUrlParser: true });

//Replace this with our schema
const HospitalSchema = new mongoose.Schema({
    hospitalName: String,
    state: String,
    city: String,
    contactNo:String,
    email:String,
    password:String,
    town:String,
    Address:String,
    PinCode: String,
    Website: String,
    HospitalLogo: String,
    offName: String,
    Specialization: String,
    AddressOfficer: String,
    emailOfficer:String,
    contactNoOfficer:String
})

const DonorSchema = {
    donorName: String,
    state: String,
    city: String,
    contactNo:String,
    email: String,
    password: String,
    age: Number
}

const AlertsSchema = {
    donorOrgan: String,
    donorUrgency: String,
    donorText: String,
    email: String
}

const OrgansSchema = {
    organ: String,
    date: String,
    time: String,
    bloodgroup: String,
    parameters: String,
    email: String
}


const ngoSchema = {
    name: String,
    regNo: String,
    ngoWebsite: String,
    ngoEmail: String,
    ngoProposal: String
}

const reportSchema = {
    email: String,
    reportName:String,
    date: String,
    time: String,
    report: String

}

HospitalSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

HospitalSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

const Hospital = mongoose.model("Hospital", HospitalSchema); //add collection name here
const Donor = mongoose.model("Donor",DonorSchema);
const Alerts = mongoose.model("Alerts",AlertsSchema);
const Organs = mongoose.model("Organs",OrgansSchema);
const Info = mongoose.model("Ngo",ngoSchema);
const Report = mongoose.model("Report",reportSchema);

app.get("/", function(req, res) {
    res.render("home");
});

//    HOSPITAL
app.get("/loginHospital", function(req, res) {
    if(req.session.hospital){
        res.render("hospitalHome");
    }else{
        res.render("loginHospital");
    }
});

app.get("/signUpHospital", function(req, res) {
    res.render("SignUpHospital");
});

app.get("/hospitalHome", function(req, res) {
    if(req.session.hospital){
        console.log(req.session.hospital);
        res.render("hospitalHome");
    }
    else{
        res.redirect("/loginHospital");
    }
    
});

app.post("/SignUpHospital", function(req, res) {
    const saltRounds = 10;
    var hashedPassword = "";
    bcrypt.hash(req.body.password, saltRounds).then(hash => {
        hashedPassword = hash;
        console.log(hashedPassword);
    }).catch(err => console.error(err.message));

    const newUser = new Hospital({
        hospitalName: req.body.hospName,
        state: req.body.stt,
        city: req.body.city,
        offName: req.body.title+ req.body.fName,
        contactNo:req.body.contactNo,
        email:req.body.email,
        town:req.body.town,
        Address:req.body.hospitalAddress,
        PinCode: req.body.pincode,
        Website:  req.body.hospitalWebsite,
        HospitalLogo: req.body.hospitalLogo,
        Specialization: req.body.specialization,
        AddressOfficer: req.body.nodalOfficerAddress,
        contactNoOfficer: req.body.nodalOfficerContactNo,
        emailOfficer: req.body.nodalOfficerEmail
    });
    
    newUser.password = newUser.generateHash(req.body.password);
    console.log(newUser.password);

    newUser.save().then(()=>{
        res.render("loginHospital");
        console.log("New Hospital " + req.body.hospName + " account has been registered");
    }).catch((err)=>{
        console.log(err);
    })
});



app.post("/loginHospital", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    Hospital.findOne({email: email},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(!foundUser.validPassword(req.body.password)){
                    res.render("loginHospitalerr");
                }else {
                    req.session.hospital= foundUser;
                    req.session.save();
                    console.log("User " + email + " has been successfully logged in");
                    res.redirect("/hospitalHome");
                }
            }else{
                
                res.render("loginHospitalerr");
            }
        }
        
    })
});

app.get("/logout",function(req,res){
    req.session.destroy();
    res.redirect("/")
});

app.get("/signUp",function(req,res){
    res.render("signUp");
});


//   DONOR




app.get("/loginDonor", function(req, res) {
    if(req.session.donor){
        res.render("donorHome");
    }else{
        res.render("donorLogin");
    }
});

app.get("/signUpDonor", function(req, res) {
    res.render("signUpDonor");
});

app.get("/donorHome", function(req, res) {
    if(req.session.donor){
        console.log(req.session.hospital);
        res.render("donorHome");
    }
    else{
        res.redirect("/loginDonor");
    }
    
});

app.post("/signUpDonor", function(req, res) {
    const newUser = new Donor({
        donorName: req.body.title + req.body.donorName,
        state:  req.body.stt,
        city:  req.body.city,
        contactNo: req.body.contact,
        email: req.body.email,
        password: req.body.password,
        age: req.body.age
    });

    newUser.save().then(()=>{
        res.render("donorLogin");
        console.log("New Donor " + req.body.donorName + " account has been registered");
    }).catch((err)=>{
        console.log(err);
    })
});

app.post("/loginDonor", function(req, res){
    const email = req.body.email;
    const password = req.body.password;

    Donor.findOne({email: email},function(err,foundUser){
        if(err){
            console.log(err);
        }
        else{
            if(foundUser){
                if(!(String(foundUser.password) === String(password))){
                    res.render("donorLoginerr");
                }else {
                    req.session.donor= foundUser;
                    req.session.save();
                    console.log("User " + email + " has been successfully logged in");
                    res.redirect("/donorHome");
                }
            }else{
                
                res.render("donorLoginerr");
            }
        }
        
    })

});

//Hospital page

app.get("/request",function(req,res){
    if(req.session.hospital){
        res.render('hospitalRequest');
    }
    else{
        res.redirect("/loginHospital");
    }
    

});

app.get("/address",function(req,res){
    if(req.session.hospital){
        res.render("hospitalAddress");
    }
    else{
        res.redirect("/loginHospital");
    }
    
});



app.get("/alert",function(req,res){
    if(req.session.hospital){
        const email = req.session.email;
        Alerts.find({},function(err,foundAlerts){
            if(!err){
                if(foundAlerts){
                    Hospital.find({},function(err,foundHospitals){
                        if(!err){
                            res.render("hospitalAlerts",{foundAlerts: foundAlerts, foundHospitals: foundHospitals,email: email});
                        }
                    })
                }else{
                    res.render("hospitalAlerts",{foundAlerts:[],foundHospitals:[],email: email});
                }
            }
        });
    }
    else{
        res.redirect("/loginHospital");
    }
    
    
});



app.get("/show",function(req,res){
    if(req.session.hospital){
        const email= req.session.hospital.email;
        Organs.find({},function(err,foundOrgans){
            if(!err){
                if(foundOrgans){
                    res.render("organDatabase",{foundOrgans:foundOrgans, email:email});
                }else{
                    res.render("organDatabase",{foundOrgans:[],email:email});
                }
                
            }
        });
    }
    else{
        res.redirect("/loginHospital");
    }

    
    
});

app.post("/show",function(req,res){

    const Id = req.body.del;
    Organs.findByIdAndRemove(Id,function(err){
        if(err)
        {
            console.log(err);
        }
        else
        {
            console.log("Deleted one item successfully");
            res.redirect("/show");
        }
    });
})

// app.post("/show",function(req,res){
//     // const query = {$text: {$search: req.body.search}};

//     const projection={
//         _id: 0,
//         organ: 1,
//         date: 0,
//         time: 0,
//         bloodgroup: 1,
//         parameters: 0,
//         email: 0

//     };

//     const cursor = Organs.findOne({$text: {$search: req.body.search}}, {projection: {_id: 0,
//         organ: 1,
//         date: 0,
//         time: 0,
//         bloodgroup: 1,
//         parameters: 0,
//         email: 0}});
//     cursor.stream().on("data",doc => console.log(doc));

// });



app.get("/organAdd",function(req,res){
    if(req.session.hospital){
        res.render("organAdd");
    }
    else{
        res.redirect("/loginHospital");
    }
    
});

app.post("/hospitalRequest", function(req, res) {
    const newAlert = new Alerts({
        donorOrgan : req.body.organ,
        donorUrgency : req.body.urgency,
        donorText : req.body.text,
        email: req.session.hospital.email
    });

    newAlert.save().then(()=>{
        res.render("hospitalRequest");
        console.log("New Alert " + req.body.organ + " has been made");
    }).catch((err)=>{
        console.log(err);
    })
});

app.post("/organAdd", function(req, res) {
    const newOrgan = new Organs({
        organ: req.body.organs,
        date: req.body.date,
        time: req.body.time,
        bloodgroup: req.body.bloodGroup,
        parameters: req.body.parameters,
        email: req.session.hospital.email
    })

    newOrgan.save().then(()=>{
        console.log("New organ " + req.body.organs + " has been added");
        res.redirect("/hospitalHome");
    }).catch((err)=>{
        console.log(err);
    })
});


app.get("/nearYou", function(req,res){
    if(req.session.donor){
        const city = req.session.donor.city;
        const state = req.session.donor.state;
        Hospital.find({},function(err,foundHospitals){
            if(!err){
                if(foundHospitals){
                    res.render("nearYou",{foundHospitals:foundHospitals, city:city, state:state});
                }else{
                    res.render("nearYou",{foundHospitals:[],city:city, state:state});
                }
                
            }
            
        });
    }else{
        res.render("donorLogin");
    }
    
    
})

app.get("/ngo", function(req,res){
    res.render("NGO");
}) 

app.post("/ngo", function(req,res){
    const ngoInfo = new Info({
        name: req.body.ngoName,
        regNo: req.body.regNo,
        ngoWebsite: req.body.ngoWebsite,
        ngoEmail: req.body.email,
        ngoProposal: req.body.ngoProposal
    })

    ngoInfo.save().then(()=>{
        console.log("Ngo " + req.body.ngoName + " is saved");
        res.render("NGO");
    }).catch((err)=>{
        console.log(err);
    })
})





app.get("/database",function(req,res){
    if(req.session.hospital){
        res.render("hospitalDatabase");
    }
    else{
        res.redirect("/loginHospital");
    }
    
});

app.get("/profileHospital",function(req,res){
    if(req.session.hospital){
        const email = req.session.hospital.email;
        Hospital.find({},function(err,foundHospital){
            console.log(foundHospital);
            res.render("profileHospital",{foundHospital:foundHospital,email:email});
        });
    }else{
        res.render("loginHospital");
    }
    
    
});

// Donor nav bar

app.get("/donorForm",function(req,res){
    if(req.session.donor){
        res.render("donorForms");
    }else{
        res.render("donorLogin");
    }
    
});

app.get("/donorProfile",function(req,res){
    if(req.session.donor){
        const email = req.session.donor.email;
        Donor.find({},function(err,foundDonor){
            console.log(foundDonor);
            res.render("donorProfile",{foundDonor:foundDonor, email:email});
        });
    }else{
        res.render("donorLogin");
    }
    
    
});

app.get("/donorReports",function(req,res){
    if(req.session.donor){
        const email = req.session.donor.email;
        Report.find({},function(err,foundReport){
            console.log(foundReport);
            res.render("donorReports",{foundReport:foundReport, email:email});
        });
    }else{
        res.render("donorLogin");
    }
    

});

app.post("/Reports",function(req,res){
    const newReport = new Report({
        email: req.session.donor.email,
        reportName:req.body.reportName,
        date: req.body.date,
        time: req.body.time,
        report: req.body.reportLink
    })

    newReport.save().then(()=>{
        console.log("report " + req.body.reportName + " is saved");
        res.redirect("/donorReports")
    }).catch((err)=>{
        console.log(err);
    })
});

app.get("/awareness",function(req,res){
    res.render("organDonationAwareness");
})





app.listen(3000, function() {
    console.log("Server starting on port 3000");
});