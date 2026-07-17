// franchiseModel.js
var mongoose = require("mongoose");

const franchiseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { 
      type: String, 
      required: false, 
      unique: true, 
      uppercase: true 
      // Auto-generated: CITY-001, RAIPUR-001
    },
    type: {
       type: String,
       enum: ["Warehouse", "PhysicalStore", "DarkStore"], // ✅ Hybrid-ready
      default: "PhysicalStore" // Default = D-Mart style (POS + online)
     },
    address: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      // Per-address geo location
      currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        updatedAt: { type: Date },
      },
    },

    servicePincodes: [{ type: String }],
    deliveryRadiusKm: { type: Number, default: 10 },
    
    contactNo: { type: String, required: true },
        
    // manager (auto-set on first StoreManager assignment)
    manager: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      required: [true, "Manager is required for franchise operation"]
    },

    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
  },
  { timestamps: true }
);

franchiseSchema.pre('save', async function(next) {
  // 🔥 FIX: Check if document is new AND code is still empty
  if (this.isNew && !this.code) {
    try {
      console.log('🔥 Generating code for:', this.address.city); // DEBUG
      
      const city = this.address.city.toUpperCase().replace(/[^A-Z]/g, '');
      let counter = 1;
      
      // 🔥 OPTIMIZED: Use findOne instead of countDocuments loop
      while (true) {
        const existing = await mongoose.model('Franchise').findOne({ 
          code: `${city}-${counter.toString().padStart(3, '0')}`
        });
        
        if (!existing) {
          this.code = `${city}-${counter.toString().padStart(3, '0')}`;
          console.log('✅ Generated code:', this.code); // DEBUG
          break;
        }
        counter++;
      }
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      return next(error);
    }
  }

  // 🔥 NEW: Validate manager role matches franchise type
  if (this.manager) {
    const User = mongoose.model('User');
    const managerUser = await User.findById(this.manager);

    if (!managerUser) {
      throw new Error('Manager user not found');
    }

    if (this.type === 'Warehouse' && managerUser.role !== 'WarehouseManager') {
      throw new Error('Warehouse must have a WarehouseManager as manager');
    }

    if (['PhysicalStore', 'DarkStore'].includes(this.type) && managerUser.role !== 'StoreManager') {
      throw new Error('PhysicalStore/DarkStore must have a StoreManager as manager');
    }
  }
  next();
});


franchiseSchema.index({ code: 1 });
franchiseSchema.index({ servicePincodes: 1 }); 
module.exports = mongoose.model("Franchise", franchiseSchema);