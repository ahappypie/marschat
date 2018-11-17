package io.github.ahappypie.marschat

import java.util.logging.Logger

import akka.actor.{ActorRef, ActorSystem}
import akka.pattern.ask
import akka.util.Timeout

import io.grpc.{Server, ServerBuilder}
import io.github.ahappypie.marschat.grpc.delay.{LightDelayGrpc, LightDelayRequest, LightDelayResponse}

import scala.concurrent.{ExecutionContext, Future}
import scala.concurrent.duration._

object LightDelayServer {
  private val logger = Logger.getLogger(classOf[LightDelayServer].getName)

  def main(args: Array[String]): Unit = {
    val actorSystem = ActorSystem("light-delay-system")
    val delaySupervisor = actorSystem.actorOf(DelaySupervisor.props, "delay-supervisor")
    val server = new LightDelayServer(ExecutionContext.global, delaySupervisor)
    server.start()
    server.blockUntilShutdown()
  }

  private val port = sys.env.getOrElse("GRPC_PORT", "50051").toInt
}

class LightDelayServer(ec: ExecutionContext, ds: ActorRef) { self =>
  private[this] var server: Server = null

  private def start(): Unit = {
    server = ServerBuilder.forPort(LightDelayServer.port).addService(LightDelayGrpc.bindService(new LightDelayImpl, ec)).build.start
    LightDelayServer.logger.info("Server started, listening on " + LightDelayServer.port)
    sys.addShutdownHook {
      System.err.println("*** shutting down gRPC server since JVM is shutting down")
      self.stop()
      System.err.println("*** server shut down")
    }
  }

  private def stop(): Unit = {
    if (server != null) {
      server.shutdown()
    }
  }

  private def blockUntilShutdown(): Unit = {
    if (server != null) {
      server.awaitTermination()
    }
  }

  private class LightDelayImpl extends LightDelayGrpc.LightDelay {
    implicit val timeout = Timeout(5 seconds)

    override def getLightDelay(req: LightDelayRequest) = {
      //val reply = LightDelayResponse(delay = 10)
      //Future.successful(reply)
      println(req.timestamp)
      ds.ask(req).mapTo[LightDelayResponse]
    }
  }

}