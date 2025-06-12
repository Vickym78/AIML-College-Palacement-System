const User = require("../../models/user.model");
const JobSchema = require("../../models/job.model");

const AllJobs = async (req, res) => {
  try {
    const jobs = await JobSchema.find();
    return res.status(200).json({ data: jobs });
  } catch (error) {
    console.log("user.all-jobs.controller.js => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

const DeleteJob = async (req, res) => {
  try {
    if (!req.body.jobId) {
      return res.status(400).json({ msg: 'Job ID is required' });
    }

    const job = await JobSchema.findById(req.body.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job not found' });
    }

    await job.deleteOne();
    return res.status(200).json({ msg: 'Job deleted successfully!' });
  } catch (error) {
    console.log("user.all-jobs.controller.js => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

const JobData = async (req, res) => {
  try {
    if (!req.params.jobId || req.params.jobId === 'undefined') {
      return res.status(400).json({ msg: "Job ID is missing" });
    }

    const job = await JobSchema.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ msg: 'Job data not found' });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.log("user.all-jobs.controller.js => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

const JobWithApplicants = async (req, res) => {
  try {
    const job = await JobSchema.findById(req.params.jobId)
      .populate({
        path: 'applicants.studentId',
        select: '_id name email' // Select name and email fields from studentId
      });

    if (!job) {
      return res.status(404).json({ msg: 'Job not found!' });
    }

    // Filter out applicants with null or undefined studentId
    const applicantsList = job.applicants
      .filter(applicant => applicant.studentId) // Only include valid applicants
      .map(applicant => ({
        id: applicant.studentId._id,
        name: applicant.studentId.name,
        email: applicant.studentId.email,
        currentRound: applicant.currentRound,
        status: applicant.status,
        appliedAt: applicant.appliedAt,
      }));

    return res.status(200).json({ applicantsList });
  } catch (error) {
    console.log("Error fetching job with applicants => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

const StudentJobsApplied = async (req, res) => {
  try {
    // Check if the studentId parameter is provided
    if (!req.params.studentId) {
      return res.status(400).json({ msg: "Student ID is required" });
    }

    const appliedJobs = await JobSchema.find({ 'applicants.studentId': req.params.studentId })
      .populate('company', 'companyName')
      .select('jobTitle _id salary applicationDeadline applicants company')
      .lean(); // Use lean for better performance with read operations

    // Map over the applied jobs to include student-specific details
    const result = appliedJobs.map(job => {
      const applicantDetails = job.applicants.find(applicant => applicant.studentId.toString() === req.params.studentId);
      return {
        jobTitle: job.jobTitle,
        jobId: job._id,
        salary: job.salary,
        applicationDeadline: job.applicationDeadline,
        companyName: job.company.companyName,
        numberOfApplicants: job.applicants.length,
        appliedAt: applicantDetails ? applicantDetails.appliedAt : null,
        status: applicantDetails ? applicantDetails.status : 'Not available',
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching student applied jobs => ", error);
    return res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports = {
  AllJobs,
  DeleteJob,
  JobData,
  JobWithApplicants,
  StudentJobsApplied,
};
