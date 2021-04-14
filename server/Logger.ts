import internal from "stream";
import * as os from "os";

const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

class Logger  {


  private enabled: boolean;
  private port: number;
  private server: string;
  private level: string;
  private hostname: string;
  con : any;


  private static instance : Logger;

  private constructor() {
    this.enabled = true;
    this.port = 9200;
    this.server = "http://127.0.0.1";
    this.level = "debug";

    if(this.enabled == true) {
      this.con = this.connect();
    }

  }

  connect()
  {
    var url = this.server +":"+this.port;
    this.hostname = os.hostname();
    var esTransportOpts = {
      level: this.level,
      clientOpts: {
        node: url,
        log: this.level,
        //   indexPrefix: 'Sitraki'
      }
    };


    if(this.enabled == true) {
      var esTransport = new ElasticsearchTransport(esTransportOpts);

      const logger = winston.createLogger({
        level: this.level,
        format: winston.format.json(),
        defaultMeta: {service: 'user-service'},
        transports: [
          esTransport,
          new winston.transports.File({filename: 'error.log', level: this.level}),
        ],
      });

      return logger;
    }
    return null;
  }

  public static getInstance(): Logger
  {
    if(!Logger.instance)
    {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  createLog(level, message, topic, jsonobject)
  {
    if(this.enabled) {



      if(this.con != null) {
        this.con.log({
          level: level,
          //indexPrefix: 'Sitraki',
          message: message,
          fields: {
            topic: topic,
            hostname: this.hostname,
            data: this.JsonToString(jsonobject)
          }
        });
      }
    }
  }

  JsonToString(json)
  {
    if(json != null && json != undefined) {
      var returnval = JSON.stringify(json);
      var retval = returnval +"";
      if(retval != null && retval != "") {
        var returnval1 = retval.replace(/\"/g,"");
        var returnval2 = returnval1.replace(/{/g, '');
        var returnval3 = returnval2.replace(/}/g, '');
        var returnval4 = returnval3.replace(/,/g, ' ');
      }
      return returnval4;
    }
    return "";
  }

  public Info = (message, topic = "Main", jsonobject = null ) => {
    this.createLog("info", message, topic, jsonobject);
  }

  public Debug = (message, topic = "Main", jsonobject = null ) => {
    this.createLog("debug", message, topic, jsonobject);
  }

  public Warn = (message, topic = "Main", jsonobject = null ) => {
    this.createLog("warn", message, topic, jsonobject);
  }

  public Fatal = (message, topic = "Main", jsonobject = null ) => {
    this.createLog("fatal", message, topic, jsonobject);
  }

  public Error = (message, topic = "Main", jsonobject = null ) => {
    this.createLog("error", message, topic, jsonobject);
  }

  public Success = (message, topic = "Main", jsonobject = null ) => {
    this.createLog("info", message, topic, jsonobject);
  }


}

export function info(message, topic = "Main", jsonobject = null)
{
  var logger = Logger.getInstance();
  logger.Info(message, topic, jsonobject);
}

export function debug(message, topic = "Main", jsonobject = null)
{
  var logger = Logger.getInstance();
  logger.Debug(message, topic, jsonobject);
}

export function fatal(message, topic = "Main", jsonobject = null)
{
  var logger = Logger.getInstance();
  logger.Fatal(message, topic, jsonobject);
}

export function warn(message, topic = "Main", jsonobject = null)
{
  var logger = Logger.getInstance();
  logger.Warn(message, topic, jsonobject);
}

export function error(message, topic = "Main", jsonobject = null)
{
  var logger = Logger.getInstance();
  logger.Error(message, topic, jsonobject);
}

export function success(message, topic = "Main", jsonobject = null)
{
  var logger = Logger.getInstance();
  logger.Success(message, topic, jsonobject);
}
