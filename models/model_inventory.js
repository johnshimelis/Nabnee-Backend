const mongoose = require("mongoose");
let random = require("mongoose-random");
const Schema = mongoose.Schema;
const InventorySchema = new Schema({
	item_id: String,
	item_name: String,
	item_name_ar: String,
	item_description: String,
	item_description_ar: String,
	item_type: String,
	item_visibility: { type: String, default: "Public" },
	item_featured: { type: Number, default: 0 },
	status: { type: String, default: "approved" },
	// item_category : {type: Schema.Types.ObjectId, ref : 'inventory_categories'},
	// item_subcategory : {type: Schema.Types.ObjectId, ref : 'inventory_subcategories'},
	item_category: { type: Schema.Types.ObjectId, ref: "business_categories" },
	item_subcategory: {
		type: Schema.Types.ObjectId,
		ref: "business_subcategories",
	},
	item_space: String,
	item_brand: String,
	item_cost: String,
	item_likes: { type: Number, default: 0 },
	item_shares: { type: Number, default: 0 },
	item_comments: [
		{
			comment: String,
			user_public_name: String,
			user_dp: String,
			comment_by: { type: Schema.Types.ObjectId, ref: "business_users" },
			addedDate: { type: Date, default: Date.now },
			mention: String,
		},
	],
	item_img: [String],
	item_main_img_index: { type: Number, default: 0 },
	item_tags: [String],
	item_mentions: [{ type: Schema.Types.ObjectId, ref: "business_users" }],
	item_theme_color: String,
	item_rate: String,
	created_by: { type: Schema.Types.ObjectId, ref: "business_users" },
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
});

InventorySchema.pre("save", function (next) {
	this.updated_at = Date.now();
	return next();
});

InventorySchema.plugin(random);
const InventorySc = mongoose.model("inventory", InventorySchema);

module.exports = InventorySc;
