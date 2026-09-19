resource "aws_iam_user" "app_user" {
  name = "secureauth-demo-app-user"

  tags = {
    Environment = var.environment
  }
}

# HIGH: Overly broad IAM policy — Action * on Resource *
resource "aws_iam_user_policy" "app_user_policy" {
  name = "secureauth-demo-full-access"
  user = aws_iam_user.app_user.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role" "app_role" {
  name = "secureauth-demo-app-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "app_role_policy" {
  name = "secureauth-demo-role-policy"
  role = aws_iam_role.app_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "*"
        Resource = "*"
      }
    ]
  })
}
