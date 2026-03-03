package model

func seedCategories() error {
	var count int64
	DB.Model(&Category{}).Where("is_default = ?", true).Count(&count)
	if count > 0 {
		return nil
	}

	defaults := []Category{
		// 支出类
		{UserID: 0, Name: "餐饮", Type: "expense", Icon: "food", Sort: 0, IsDefault: true},
		{UserID: 0, Name: "交通", Type: "expense", Icon: "transport", Sort: 1, IsDefault: true},
		{UserID: 0, Name: "购物", Type: "expense", Icon: "shopping", Sort: 2, IsDefault: true},
		{UserID: 0, Name: "娱乐", Type: "expense", Icon: "entertainment", Sort: 3, IsDefault: true},
		{UserID: 0, Name: "住房", Type: "expense", Icon: "housing", Sort: 4, IsDefault: true},
		{UserID: 0, Name: "通讯", Type: "expense", Icon: "communication", Sort: 5, IsDefault: true},
		{UserID: 0, Name: "医疗", Type: "expense", Icon: "medical", Sort: 6, IsDefault: true},
		{UserID: 0, Name: "教育", Type: "expense", Icon: "education", Sort: 7, IsDefault: true},
		{UserID: 0, Name: "其他", Type: "expense", Icon: "other", Sort: 8, IsDefault: true},
		// 收入类
		{UserID: 0, Name: "工资", Type: "income", Icon: "salary", Sort: 0, IsDefault: true},
		{UserID: 0, Name: "奖金", Type: "income", Icon: "bonus", Sort: 1, IsDefault: true},
		{UserID: 0, Name: "兼职", Type: "income", Icon: "parttime", Sort: 2, IsDefault: true},
		{UserID: 0, Name: "理财", Type: "income", Icon: "investment", Sort: 3, IsDefault: true},
		{UserID: 0, Name: "其他", Type: "income", Icon: "other", Sort: 4, IsDefault: true},
	}

	return DB.Create(&defaults).Error
}
