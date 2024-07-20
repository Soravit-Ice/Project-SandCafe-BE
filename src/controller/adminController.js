const { PrismaClient } = require("@prisma/client")
var jwt = require('jsonwebtoken')
const config = require('../config/config.js')
const userClient = new PrismaClient().user;
const { format } = require('date-fns');

// findReportMonth
exports.findReportMonth = async (req, res) => {
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59, 999);
    const response = {
        reportSumPaid : 0,
        user: [],
        visitorView: 0
    }
  try {
    const allUser = await userClient.findMany({
        include: {
            drugDates: {
                take:1,
                orderBy:{
                    date_get:'desc'
                }
            },
          },
        where:{
            created_at:{
                gte: startOfMonth,
                lte: endOfMonth,
            },
            role:{
                not: "ADMIN"
            }
        }
    });
    console.log("data", allUser)
    let totalPaid = allUser.reduce((sum, user) => {
        let paidNum = parseFloat(user.paid_num);
        return sum + (isNaN(paidNum) ? 0 : paidNum);
    }, 0);

    let totalVisitor = allUser.reduce((sum, user) => {
        let visitorSum = parseFloat(user.visitor);
        return sum + (isNaN(visitorSum) ? 0 : visitorSum);
    }, 0);

    allUser.forEach(data => {
        let modelForReportUser = {
            expire_object:null,
            get_date:null,
            hn_id:null

        }
        modelForReportUser.expire_object = format(new Date(data.expire_object), 'dd/MM/yyyy')
        modelForReportUser.get_date = format(new Date(data.drugDates[0].date_get), 'dd/MM/yyyy')
        modelForReportUser.hn_id = data.hn_id
        response.user.push(modelForReportUser)
    })

    response.reportSumPaid = totalPaid
    response.visitorView = totalVisitor
    res.status(200).json({ data: response });
  } catch (e) {
    console.log(e);
  }
};




