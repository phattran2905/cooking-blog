const AdminModel = require("../../models/AdministratorModel");
const authUtils = require("../../utils/authUtils");
const adminUtils = require("../../utils/administratorUtils");
const commonUtils = require("../../utils/commonUtils");
const validation = require('../../validation/admin/validateAdministrator');
const {body, validationResult, matchedData} = require("express-validator");

module.exports = function(adminRouter){
    adminRouter.get(
        "/administrators", 
        async (req, res) => {
            const administrators = await AdminModel.find();
            res.render(
                "admin/administrator/administrator_base",
                { 
                    content: 'administrators',
                    administrators: administrators, 
                    information: authUtils.getAdminProfile(req)
                });
        }
    );
    
    adminRouter.get(
        "/administrators/add", 
        (req,res) => {    
            res.render(
                "admin/administrator/administrator_base",
                {
                    content: 'add',
                    information: authUtils.getAdminProfile(req)
                });
        }
    );
    
    adminRouter.post(
        "/administrators/add",
        validation.add,
        async (req, res) => {
            const { hasError, errors, validInput } = validation.result(req);
                
            if(hasError) { 
                return  res.render('admin/administrator/administrator_base',{
                    errors: errors, 
                    validInput: validInput,
                    content: 'add',
                    information: authUtils.getAdminProfile(req)
                });
            };

            try {
                const adminObj = await adminUtils.createNewAdmin(
                    req.body.username,
                    req.body.email,
                    req.body.password,
                    req.body.role
                );
    
                if (adminObj) {
                    req.flash("success", "Successfully. A new administrator was added.");
                } else {
                    req.flash("fail", "Failed. An error occurred during the process.");
                }
    
                return res.redirect("/admin/administrators/add");
            } catch (error) {
                return res.render(
                    "pages/404", 
                    {redirectLink: '/admin/administrators'}
                  );
            }
        }
    );
    
    adminRouter.get(
      "/administrators/update/:username",
      async (req, res) => {
        try {
          const admin = await AdminModel.findOne({ username: req.params.username });
          if(admin) {
            return res.render(
                "admin/administrator/administrator_base", 
                  { 
                      content: 'update',
                      admin: admin,
                      information: authUtils.getAdminProfile(req)
                  });
          }

          return res.render(
              "pages/404", 
              {redirectLink: '/admin/administrators'}
            );
        } catch (error) {
            return res.render(
                "pages/404", 
                {redirectLink: '/admin/administrators'}
              );
        }
      }
    );
    
    adminRouter.post(
        "/administrators/update/:username", 
        validation.update,
        async (req, res) => {
            try {
                const admin = await AdminModel.findOne({ username: req.params.username });
                if (admin){
                    const { hasError, errors, validInput } = validation.result(req);
            
                    if(hasError) { 
                        return  res.render(
                            'admin/administrator/administrator_base',{
                            errors: errors, 
                            validInput: validInput,
                            content: 'update',
                            admin: admin,
                            information: authUtils.getAdminProfile(req)
                        });
                    };

                    const updatedAdmin = await AdminModel.findOneAndUpdate(
                        {_id: admin.id},
                        {
                            username: req.body.username,
                            email: req.body.email,
                            role: req.body.role
                        },{new: true}); // Return the updated object
    
                    if (updatedAdmin){
                        req.flash('updateSuccess', 'Successfully. All changes were saved.');
                        return res.redirect("/admin/administrators/update/" + updatedAdmin.username);
                    }
                    
                    req.flash('updateFail', 'Failed. An error occurred during the process.');
                    return res.redirect("/admin/administrators/update/" + admin.username);
                }
                
                return res.render(
                    "pages/404", 
                    {redirectLink: '/admin/administrators'}
                );
            } catch (error) {
                return res.render(
                    "pages/404", 
                    {redirectLink: '/admin/administrators'}
                );
            }
    });
    
    adminRouter.post(
        "/administrators/activate/:username", 
        async (req, res) => {
        try {
            const adminObj = await AdminModel.findOne({ username: req.params.username });
            if (adminObj && adminObj.status === "Deactivated") {
                adminObj.status = "Activated";
                await adminObj.save();
    
                req.flash("statusSuccess", "Successfully. The status was changed to 'Activated'");
            } else {
                req.flash("statusFail", "Failed. An error occurred during the process.");
            }
            return res.redirect("/admin/administrators");
        } catch (error) {
            return res.sendStatus(404).render('pages/404');
        }
    });
    
    adminRouter.post(
        "/administrators/deactivate/:username", 
        async (req, res) => {
        try {
            const adminObj = await AdminModel.findOne({ username: req.params.username });
            if (adminObj && adminObj.status === "Activated") {
                adminObj.status = "Deactivated";
                await adminObj.save();
                req.flash("statusSuccess", "Successfully. The status was changed to 'Deactivated'");
            } else {
                req.flash("statusFail", "Failed. An error occurred during the process.");
            }
            return res.redirect("/admin/administrators");
        } catch (error) {
            return res.sendStatus(404).render('pages/404');
        }
    });
    
    adminRouter.post(
        "/administrators/reset_password/", 
        async (req, res) => {
        try {
            const adminObj = await AdminModel.findByIdAndUpdate({  _id: req.body.id },{ password: 'Reset Password' });
            if (adminObj) {
                req.flash("resetSuccess", "Successfully. A link was sent to email for setting up a new password.");
            } else {
                req.flash("resetFail", "Failed. An error occurred during the process.");
            }
            return res.redirect("/admin/administrators");
        } catch (error) {
            return res.sendStatus(404).render('pages/404');
        }
    });
    
    adminRouter.post(
        "/administrators/delete/", 
        async (req, res) => {
        try {
            const adminObj = await AdminModel.findByIdAndDelete({ _id: req.body.id });
            
            if (adminObj) {
                req.flash("deleteSuccess", "Successfully. The administrator was removed from the database.");
            } else {
                req.flash("deleteFail", "Failed. An error occurred during the process");
            }
            return res.redirect("/admin/administrators");
        } catch (error) {
            return res.sendStatus(404).render('pages/404');
        }
    });
};
