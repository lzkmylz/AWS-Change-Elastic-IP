const AWS = require('aws-sdk');
const _ = require('underscore');
const async = require('async');
AWS.config.update({ region: 'ap-southeast-1' });

const ec2 = new AWS.EC2();

var get_vpc_info = (callback) => {
  var vpc_info;
  ec2.describeAddresses({}, (err, data) => {
    if(err) {
      console.log(err);
    } else {
      vpc_info = JSON.parse(JSON.stringify(data.Addresses[0]));
      callback(null, vpc_info);
      console.log('get vpc_info success', vpc_info);
    }
  });
}

var disassociate_Elastic_IP = (vpc_info, callback) => {
  var params = {
    AssociationId: vpc_info.AssociationId
  };
  ec2.disassociateAddress(params, (err, data) => {
    if(err) {
      console.log(err);
    } else {
      callback(null, vpc_info);
      console.log('get disassociate_Elastic_IP success');
    }
  })
};

var release_Elastic_IP = (vpc_info, callback) => {
  var params = {
    AllocationId: vpc_info.AllocationId
  };
  ec2.releaseAddress(params, (err, data) => {
    if(err) {
      console.log(err);
    } else {
      var instanceId = vpc_info.InstanceId;
      callback(null, instanceId);
      console.log('release elastic ip success');
    }
  })
};

var allocate_new_Elastic_IP = (InstanceID, callback) => {
  var params = {
    Domain: "vpc"
  };
  ec2.allocateAddress(params, (err, data) => {
    if(err) {
      console.log(err);
    } else {
      callback(null, data.AllocationId, InstanceID, data.PublicIp);
      console.log('get allocate_new_Elastic_IP success', data.AllocationId, InstanceID, data.PublicIp);
    }
  })
};

var associate_Elastic_IP_with_instance = (AllocationId, InstanceID, PublicIp, callback) => {
  var params = {
    AllocationId: AllocationId, 
    InstanceId: InstanceID
  };
  ec2.associateAddress(params, (err, data) => {
    if(err) {
      console.log(err);
    } else {
      callback(null, PublicIp);
      console.log('get associate_Elastic_IP_with_instance success', PublicIp);
    }
  })
}

async.waterfall([
  get_vpc_info,
  disassociate_Elastic_IP,
  release_Elastic_IP,
  allocate_new_Elastic_IP,
  associate_Elastic_IP_with_instance
], (err, data) => {
  if(err) {
    console.log(err);
  } else {
    console.log(data);
  }
});
